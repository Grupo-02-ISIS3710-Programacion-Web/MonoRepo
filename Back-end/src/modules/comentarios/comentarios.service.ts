import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { Comentario } from './entities/comentario.entity';

@Injectable()
export class ComentariosService {
  private readonly logger = new Logger(ComentariosService.name);

  constructor(
    @InjectModel('Comentario')
    private readonly comentarioModel: Model<Comentario>,
    @InjectModel('Producto')
    private readonly productoModel: Model<any>,
  ) {}

  async create(createComentarioDto: CreateComentarioDto) {
    const { userId, productId, comment } = createComentarioDto;

    this.logger.log(
      `Creando comentario para producto ${productId} del usuario ${userId}`,
    );

    const created = await this.comentarioModel.create({
      userId: new Types.ObjectId(userId),
      productId: new Types.ObjectId(productId),
      comment,
      upvotes: [],
      downvotes: [],
    });

    await this.productoModel.findByIdAndUpdate(productId, {
      $push: { comments: created._id },
    });

    this.logger.log(`Comentario ${created._id} creado exitosamente`);
    return created;
  }

  async findByProductId(productId: string) {
    this.logger.log(`Buscando comentarios para producto ${productId}`);

    const comentarios = await this.comentarioModel
      .find({ productId: new Types.ObjectId(productId) })
      .populate('userId', 'nombre avatarUrl')
      .sort({ createdAt: -1 })
      .exec();

    this.logger.log(
      `${comentarios.length} comentarios encontrados para producto ${productId}`,
    );
    return comentarios;
  }

  async findAll() {
    this.logger.log('Listando todos los comentarios');
    const comentarios = await this.comentarioModel.find().exec();
    this.logger.log(`${comentarios.length} comentarios encontrados`);
    return comentarios;
  }

  async findOne(id: string) {
    this.logger.log(`Buscando comentario ${id}`);
    const comentario = await this.comentarioModel.findById(id).exec();
    if (!comentario) {
      this.logger.warn(`Comentario ${id} no encontrado`);
      throw new NotFoundException(`Comentario ${id} not found`);
    }
    return comentario;
  }

  async update(id: string, updateComentarioDto: UpdateComentarioDto) {
    this.logger.log(`Actualizando comentario ${id}`);
    const updated = await this.comentarioModel
      .findByIdAndUpdate(id, updateComentarioDto, { new: true })
      .exec();
    if (!updated) {
      this.logger.warn(`Comentario ${id} no encontrado para actualizar`);
      throw new NotFoundException(`Comentario ${id} not found`);
    }
    this.logger.log(`Comentario ${id} actualizado exitosamente`);
    return updated;
  }

  async remove(id: string) {
    this.logger.log(`Eliminando comentario ${id}`);
    const deleted = await this.comentarioModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      this.logger.warn(`Comentario ${id} no encontrado para eliminar`);
      throw new NotFoundException(`Comentario ${id} not found`);
    }

    await this.productoModel.updateMany(
      { comments: new Types.ObjectId(id) },
      { $pull: { comments: new Types.ObjectId(id) } },
    );

    this.logger.log(`Comentario ${id} eliminado exitosamente`);
    return deleted;
  }

  async upvote(id: string, userId: string) {

    this.logger.log(
      `Votando comentario ${id} por usuario ${userId}`
    );

    const comentario =
      await this.comentarioModel
        .findById(id)
        .exec();

    if (!comentario) {

      this.logger.warn(
        `Comentario ${id} no encontrado para votar`
      );

      throw new NotFoundException(
        `Comentario ${id} not found`
      );
    }

    comentario.upvotes =
      comentario.upvotes || [];

    comentario.downvotes =
      comentario.downvotes || [];

    if (
      comentario.upvotes.includes(userId)
    ) {

      comentario.upvotes =
        comentario.upvotes.filter(
          (u: string) => u !== userId,
        );

    } else {

      comentario.downvotes =
        comentario.downvotes.filter(
          (u: string) => u !== userId,
        );

      comentario.upvotes.push(userId);
    }

    await comentario.save();


    return await this.comentarioModel
      .findById(id)
      .populate(
        "userId",
        "nombre avatarUrl"
      )
      .exec();
  }

  async downvote(
    id: string,
    userId: string,
  ) {

    const comment =
      await this.comentarioModel.findById(id);

    if (!comment) {
      return null;
    }

    comment.upvotes =
      comment.upvotes || [];

    comment.downvotes =
      comment.downvotes || [];

    comment.upvotes =
      comment.upvotes.filter(
        (uid) => uid !== userId,
      );

    const alreadyDownvoted =
      comment.downvotes.includes(userId);

    if (alreadyDownvoted) {

      comment.downvotes =
        comment.downvotes.filter(
          (uid) => uid !== userId,
        );

    } else {

      comment.downvotes.push(userId);
    }

    await comment.save();

    return await this.comentarioModel
      .findById(id)
      .populate(
        "userId",
        "nombre avatarUrl"
      );
  }
}
