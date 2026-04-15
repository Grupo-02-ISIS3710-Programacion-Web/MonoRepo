import { Injectable } from '@nestjs/common';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

import { Comentario } from './entities/comentario.entity';

@Injectable()
export class ComentariosService {
  create(createComentarioDto: CreateComentarioDto) {
    const comentario = new Comentario();
    comentario.id = Math.random().toString(36).substring(2, 15);
    comentario.userId = createComentarioDto.userId;
    comentario.comment = createComentarioDto.comment;
    comentario.createdAt = new Date().toISOString();
    comentario.upvotes =  [];
    comentario.downvotes = [];
    return comentario;
  }

  findAll() {
    return `This action returns all comentarios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comentario`;
  }

  update(id: number, updateComentarioDto: UpdateComentarioDto) {
    return `This action updates a #${id} comentario`;
  }

  remove(id: number) {
    return `This action removes a #${id} comentario`;
  }

  upvote(id: number, userId: string) {
    const comentario: Comentario = this.findOne(id);
    if (!comentario) {
      return `Comentario with id ${id} not found`;
    }
    if (comentario.upvotes.includes(userId)) {
      return `User ${userId} has already upvoted this comentario`;
    }
    comentario.upvotes.push(userId);
    return comentario;
  }
}
