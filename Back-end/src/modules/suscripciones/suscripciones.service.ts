import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Suscripcion } from './entities/suscripcion.entity';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';

@Injectable()
export class SuscripcionesService {
  private readonly mpApiUrl = 'https://api.mercadopago.com';

  constructor(
    @InjectModel(Suscripcion.name)
    private readonly suscripcionModel: Model<Suscripcion>,
    @InjectModel('User')
    private readonly userModel: Model<any>,
    private readonly httpService: HttpService,
  ) {}

  private getHeaders() {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    if (token.startsWith('TEST-')) {
      headers['X-scope'] = 'stage';
    }
    return headers;
  }

  async create(createDto: CreateSuscripcionDto) {
    const user = await this.userModel.findById(createDto.userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.isPremium) {
      throw new BadRequestException('El usuario ya es Premium');
    }

    const amount = createDto.transactionAmount || 20000;
    const currency = createDto.currencyId || 'COP';

    const body = {
      reason: 'Skin4All Premium - Suscripción Mensual',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        start_date: new Date(Date.now() + 3600000).toISOString(),
        transaction_amount: amount,
        currency_id: currency,
      },
      payer_email: createDto.payerEmail,
      token: createDto.cardTokenId,
      status: 'authorized',
      back_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/suscripcion`,
      notification_url: `${process.env.API_URL || 'http://localhost:5001'}/suscripciones/webhook`,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<any>(`${this.mpApiUrl}/preapproval`, body, {
          headers: this.getHeaders(),
        }),
      );

      const preapproval = response.data;

      const suscripcion = new this.suscripcionModel({
        userId: createDto.userId,
        preapprovalId: preapproval.id,
        status: preapproval.status,
        payerEmail: createDto.payerEmail,
        transactionAmount: amount,
        currencyId: currency,
        frequency: 1,
        frequencyType: 'months',
        nextPaymentDate: preapproval.next_payment_date
          ? new Date(preapproval.next_payment_date)
          : undefined,
        externalReference: preapproval.external_reference,
        active: preapproval.status === 'authorized',
      });

      await suscripcion.save();

      await this.userModel.findByIdAndUpdate(createDto.userId, {
        isPremium: preapproval.status === 'authorized',
        preapprovalId: preapproval.id,
        subscriptionStatus: preapproval.status,
      });

      return {
        preapprovalId: preapproval.id,
        status: preapproval.status,
      };
    } catch (error) {
      if (error.response?.data) {
        throw new BadRequestException(
          error.response.data.message || 'Error al crear la suscripción en Mercado Pago',
        );
      }
      throw new InternalServerErrorException('Error al crear la suscripción');
    }
  }

  async getStatus(userId: string) {
    const suscripcion = await this.suscripcionModel
      .findOne({ userId, active: true })
      .sort({ createdAt: -1 });

    if (!suscripcion) {
      const user = await this.userModel.findById(userId);
      return { isPremium: user?.isPremium || false };
    }

    return { isPremium: suscripcion.status === 'authorized' };
  }

  async cancel(preapprovalId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.put<any>(
          `${this.mpApiUrl}/preapproval/${preapprovalId}`,
          { status: 'cancelled' },
          { headers: this.getHeaders() },
        ),
      );

      await this.suscripcionModel.findOneAndUpdate(
        { preapprovalId },
        { status: 'cancelled', active: false },
      );

      await this.userModel.findOneAndUpdate(
        { preapprovalId },
        { isPremium: false, subscriptionStatus: 'cancelled' },
      );

      return { message: 'Suscripción cancelada exitosamente' };
    } catch (error) {
      if (error.response?.data) {
        throw new BadRequestException(
          error.response.data.message || 'Error al cancelar la suscripción',
        );
      }
      throw new InternalServerErrorException('Error al cancelar la suscripción');
    }
  }

  async handleWebhook(body: any, query: any) {
    const topic = query.topic || query.type;
    const id = query['data.id'] || body?.data?.id;

    if (!id) return { received: true };

    try {
      if (topic === 'preapproval' || topic === 'subscription_preapproval') {
        const response = await firstValueFrom(
          this.httpService.get<any>(`${this.mpApiUrl}/preapproval/${id}`, {
            headers: this.getHeaders(),
          }),
        );

        const preapproval = response.data;

        const isActive = preapproval.status === 'authorized';

        await this.suscripcionModel.findOneAndUpdate(
          { preapprovalId: id },
          {
            status: preapproval.status,
            active: isActive,
            nextPaymentDate: preapproval.next_payment_date
              ? new Date(preapproval.next_payment_date)
              : undefined,
          },
        );

        if (preapproval.payer_email) {
          await this.userModel.findOneAndUpdate(
            { preapprovalId: id },
            {
              isPremium: isActive,
              subscriptionStatus: preapproval.status,
            },
          );
        }
      }

      if (topic === 'subscription_authorized_payment' || topic === 'authorized_payment') {
        const response = await firstValueFrom(
          this.httpService.get<any>(
            `${this.mpApiUrl}/authorized_payments/${id}`,
            { headers: this.getHeaders() },
          ),
        );

        const payment = response.data;
        if (payment.status === 'rejected' || payment.status === 'cancelled') {
          const suscripcion = await this.suscripcionModel.findOne({
            preapprovalId: payment.preapproval_id,
          });

          if (suscripcion) {
            const count = await this.suscripcionModel.countDocuments({
              preapprovalId: payment.preapproval_id,
              status: 'authorized',
            });

            if (count > 0) {
              const recentPayments = await firstValueFrom(
                this.httpService.get<any>(
                  `${this.mpApiUrl}/preapproval/${payment.preapproval_id}/payments`,
                  { headers: this.getHeaders() },
                ),
              );

              const rejectedCount = recentPayments.data?.results?.filter(
                (p: any) => p.status === 'rejected' || p.status === 'cancelled',
              ).length || 0;

              if (rejectedCount >= 3) {
                await this.cancel(payment.preapproval_id);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Webhook processing error:', error?.response?.data || error.message);
    }

    return { received: true };
  }
}
