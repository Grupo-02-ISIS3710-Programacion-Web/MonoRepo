import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

import { Comentario } from './entities/comentario.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ComentariosService {
    constructor(@InjectModel('Comentario')
    private readonly comentarioModel: Model<Comentario>,) { }

    async create(createComentarioDto: CreateComentarioDto) {
        const payload = {
            userId: createComentarioDto.userId,
            comment: createComentarioDto.comment,
            createdAt: new Date().toISOString(),
            upvotes: [],
            downvotes: [],
        };
        const created = await this.comentarioModel.create(payload);
        return created;
    }

    async findAll() {
        return this.comentarioModel.find().exec();
    }

    async findOne(id: string) {
        const comentario = await this.comentarioModel.findOne({ _id: id }).exec();
        if (!comentario) throw new NotFoundException(`Comentario with id ${id} not found`);
        return comentario;
    }

    async update(id: string, updateComentarioDto: UpdateComentarioDto) {
        const updated = await this.comentarioModel.findOneAndUpdate({ _id: id }, updateComentarioDto, { new: true }).exec();
        if (!updated) throw new NotFoundException(`Comentario with id ${id} not found`);
        return updated;
    }

    async remove(id: string) {
        const deleted = await this.comentarioModel.findOneAndDelete({ _id: id }).exec();
        if (!deleted) throw new NotFoundException(`Comentario with id ${id} not found`);
        return deleted;
    }

    async upvote(id: string, userId: string) {
        const comentario = await this.comentarioModel.findOne({ _id: id }).exec();
        if (!comentario) {
            throw new NotFoundException(`Comentario with id ${id} not found`);
        }
        if (comentario.upvotes.includes(userId)) return comentario;
        comentario.downvotes = comentario.downvotes.filter((u: string) => u !== userId);
        comentario.upvotes.push(userId);
        await comentario.save();
        return comentario;
    }
}
