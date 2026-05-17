import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { Comentario } from './entities/comentario.entity';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel('Comentario')
    private readonly comentarioModel: Model<Comentario>,
    @InjectModel('Producto')
    private readonly productoModel: Model<any>,
  ) {}

async create(createComentarioDto: CreateComentarioDto) {
  const { userId, productId, comment } = createComentarioDto;

  const created = await this.comentarioModel.create({
    userId: new Types.ObjectId(userId), 
    productId: new Types.ObjectId(productId),
    comment,
    upvotes: [],
    downvotes: [],
  });

  await this.productoModel.findByIdAndUpdate(
    productId,
    { $push: { comments: created._id } },
  );

  return created;
}

async findByProductId(productId: string) {
  return this.comentarioModel
    .find({ productId: new Types.ObjectId(productId) })
    .populate('userId', 'nombre avatarUrl')
    .sort({ createdAt: -1 })
    .exec();
}

  async findAll() {
    return this.comentarioModel.find().exec();
  }

  async findOne(id: string) {
    const comentario = await this.comentarioModel.findById(id).exec();
    if (!comentario) throw new NotFoundException(`Comentario ${id} not found`);
    return comentario;
  }

  async update(id: string, updateComentarioDto: UpdateComentarioDto) {
    const updated = await this.comentarioModel
      .findByIdAndUpdate(id, updateComentarioDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Comentario ${id} not found`);
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.comentarioModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException(`Comentario ${id} not found`);

    // Desvincular del producto
    await this.productoModel.updateMany(
      { comments: new Types.ObjectId(id) },
      { $pull: { comments: new Types.ObjectId(id) } },
    );

    return deleted;
  }

  async upvote(id: string, userId: string) {
    const comentario = await this.comentarioModel.findById(id).exec();
    if (!comentario) throw new NotFoundException(`Comentario ${id} not found`);
    if (comentario.upvotes.includes(userId)) return comentario;
    comentario.downvotes = comentario.downvotes.filter((u: string) => u !== userId);
    comentario.upvotes.push(userId);
    await comentario.save();
    return comentario;
  }
}