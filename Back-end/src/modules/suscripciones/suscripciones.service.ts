import * as crypto from 'crypto';
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
  private readonly wompiApiUrl: string;

  constructor(
    @InjectModel(Suscripcion.name)
    private readonly suscripcionModel: Model<Suscripcion>,
    @InjectModel('User')
    private readonly userModel: Model<any>,
    private readonly httpService: HttpService,
  ) {
    const useLive = process.env.IS_PRODUCTION === 'true';
    this.wompiApiUrl = useLive
      ? 'https://production.wompi.co/v1'
      : 'https://sandbox.wompi.co/v1';
  }

  private getPrivateHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY || ''}`,
    };
  }

  async getMerchantInfo() {
    const publicKey = process.env.WOMPI_PUBLIC_KEY || '';
    const response = await firstValueFrom(
      this.httpService.get<any>(`${this.wompiApiUrl}/merchants/${publicKey}`, {
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    return response.data;
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
    const amountInCents = amount * 100;
    const currency = createDto.currencyId || 'COP';

    let paymentSourceData: any;
    try {
      const response = await firstValueFrom(
        this.httpService.post<any>(
          `${this.wompiApiUrl}/payment_sources`,
          {
            type: 'CARD',
            token: createDto.token,
            customer_email: createDto.payerEmail,
            acceptance_token: createDto.acceptanceToken,
            accept_personal_auth: createDto.acceptPersonalAuth,
          },
          { headers: this.getPrivateHeaders() },
        ),
      );
      paymentSourceData = response.data.data;
    } catch (error) {
      const wompiError = error.response?.data;
      console.error('Wompi payment source error:', JSON.stringify(wompiError));
      if (wompiError) {
        const msg = wompiError.error?.reason || wompiError.message || JSON.stringify(wompiError);
        throw new BadRequestException(`Wompi: ${msg}`);
      }
      throw new InternalServerErrorException('Error al crear la fuente de pago');
    }

    const paymentSourceId = paymentSourceData.id;
    const reference = `SUB-${Date.now()}-${createDto.userId.slice(-8)}`;

    const integrityStr = `${reference}${amountInCents}COP${process.env.WOMPI_INTEGRITY_SECRET || ''}`;
    const signature = crypto.createHash('sha256').update(integrityStr).digest('hex');

    let transactionData: any;
    try {
      const response = await firstValueFrom(
        this.httpService.post<any>(
          `${this.wompiApiUrl}/transactions`,
          {
            amount_in_cents: amountInCents,
            currency,
            customer_email: createDto.payerEmail,
            payment_method: { installments: 1 },
            reference,
            signature,
            payment_source_id: paymentSourceId,
          },
          { headers: this.getPrivateHeaders() },
        ),
      );
      transactionData = response.data.data;
    } catch (error) {
      if (error.response?.data) {
        throw new BadRequestException(
          error.response.data.message || 'Error al crear la transacción en Wompi',
        );
      }
      throw new InternalServerErrorException('Error al crear la transacción');
    }

    let finalStatus = transactionData.status;
    if (finalStatus === 'PENDING') {
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 500));
        try {
          const statusRes = await firstValueFrom(
            this.httpService.get<any>(
              `${this.wompiApiUrl}/transactions/${transactionData.id}`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.WOMPI_PUBLIC_KEY || ''}`,
                },
              },
            ),
          );
          finalStatus = statusRes.data.data.status;
          if (['APPROVED', 'DECLINED', 'VOIDED', 'ERROR'].includes(finalStatus)) break;
        } catch {
          break;
        }
      }
    }

    if (finalStatus === 'DECLINED') {
      await firstValueFrom(
        this.httpService.put<any>(
          `${this.wompiApiUrl}/payment_sources/${paymentSourceId}/void`,
          {},
          { headers: this.getPrivateHeaders() },
        ),
      ).catch(() => {});
      throw new BadRequestException(
        'La transacción fue declinada. Verifica los datos de la tarjeta.',
      );
    }

    const isApproved = finalStatus === 'APPROVED';

    const suscripcion = new this.suscripcionModel({
      userId: createDto.userId,
      paymentSourceId,
      wompiTransactionId: transactionData.id,
      status: finalStatus,
      payerEmail: createDto.payerEmail,
      transactionAmount: amount,
      currencyId: currency,
      reference,
      active: isApproved,
    });

    await suscripcion.save();

    if (isApproved) {
      await this.userModel.findByIdAndUpdate(createDto.userId, {
        isPremium: true,
        paymentSourceId,
        subscriptionStatus: finalStatus,
      });
    }

    return {
      transactionId: transactionData.id,
      status: finalStatus,
      paymentSourceId,
    };
  }

  async getStatus(userId: string) {
    const suscripcion = await this.suscripcionModel
      .findOne({ userId, active: true })
      .sort({ createdAt: -1 });

    if (!suscripcion) {
      const user = await this.userModel.findById(userId);
      return { isPremium: user?.isPremium || false };
    }

    return { isPremium: suscripcion.active };
  }

  async cancel(paymentSourceId: number) {
    try {
      await firstValueFrom(
        this.httpService.put<any>(
          `${this.wompiApiUrl}/payment_sources/${paymentSourceId}/void`,
          {},
          { headers: this.getPrivateHeaders() },
        ),
      );

      await this.suscripcionModel.findOneAndUpdate(
        { paymentSourceId },
        { status: 'VOIDED', active: false },
      );

      await this.userModel.findOneAndUpdate(
        { paymentSourceId },
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

  async handleWebhook(body: any) {
    if (body.event !== 'transaction.updated') {
      return { received: true };
    }

    const eventSignature = body.signature;
    const timestamp = body.timestamp;
    const eventSecret = process.env.WOMPI_EVENT_SECRET || '';

    let concatStr = '';
    for (const prop of eventSignature.properties) {
      const parts = prop.split('.');
      let value: any = body.data;
      for (const part of parts) {
        if (value && typeof value === 'object') {
          value = value[part];
        } else {
          value = undefined;
          break;
        }
      }
      concatStr += value ?? '';
    }
    concatStr += timestamp + eventSecret;

    const calculatedChecksum = crypto
      .createHash('sha256')
      .update(concatStr)
      .digest('hex')
      .toUpperCase();

    if (calculatedChecksum !== eventSignature.checksum) {
      return { received: true };
    }

    const transaction = body.data?.transaction;
    if (!transaction) return { received: true };

    try {
      const isActive = transaction.status === 'APPROVED';

      await this.suscripcionModel.findOneAndUpdate(
        { wompiTransactionId: transaction.id },
        { status: transaction.status, active: isActive },
      );

      const suscripcion = await this.suscripcionModel.findOne({
        wompiTransactionId: transaction.id,
      });

      if (suscripcion) {
        await this.userModel.findByIdAndUpdate(suscripcion.userId, {
          isPremium: isActive,
          subscriptionStatus: transaction.status,
        });
      }
    } catch (error) {
      console.error('Webhook processing error:', error.message);
    }

    return { received: true };
  }
}
