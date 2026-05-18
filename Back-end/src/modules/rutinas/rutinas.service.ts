import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRutinaDto } from './dto/create-rutina.dto';
import { UpdateRutinaDto } from './dto/update-rutina.dto';
import { Rutina } from './entities/rutina.entity';
import { User } from '../user/entities/user.entity';
import { Comentario } from '../comentarios/entities/comentario.entity';

@Injectable()
export class RutinasService {
  private readonly logger = new Logger(RutinasService.name);

  constructor(
    @InjectModel('Rutina') private readonly rutinaModel: Model<Rutina>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Comentario')
    private readonly comentarioModel: Model<Comentario>,
  ) {}

  async create(createRutinaDto: CreateRutinaDto) {
    this.logger.log(
      `Creando rutina para usuario ${createRutinaDto.userId}: "${createRutinaDto.name}" (tipo: ${createRutinaDto.type}, piel: ${createRutinaDto.skinType})`,
    );
    try {
      const newRutina = new this.rutinaModel({
        ...createRutinaDto,
        publishedAt: createRutinaDto.publishedAt || new Date().toISOString(),
        views: 0,
        deleted: false,
        upvotes: [],
        downvotes: [],
      });
      const saved = await newRutina.save();

      await this.userModel
        .findByIdAndUpdate(createRutinaDto.userId, {
          $push: { createdRoutineIds: saved._id.toString() },
        })
        .exec();

      this.logger.log(
        `Rutina creada exitosamente con ID: ${saved._id} para usuario ${createRutinaDto.userId} (${saved.steps?.length || 0} pasos)`,
      );
      return saved;
    } catch (error) {
      this.logger.error(
        `Error al crear rutina para usuario ${createRutinaDto.userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(
    page?: number,
    sort?: 'newest' | 'mostCommented' | 'mostVoted',
  ) {
    const pageSize = 20;
    const pageNum = page ? Math.max(1, page) : 1;
    const skip = (pageNum - 1) * pageSize;

    this.logger.log(
      `Listando rutinas: página ${pageNum}, orden: ${sort || 'newest'}`,
    );

    try {
      if (sort === 'mostCommented') {
        const commentedResults = await this.rutinaModel.aggregate([
          { $match: { deleted: false } },
          {
            $addFields: {
              commentCount: { $size: { $ifNull: ['$comments', []] } },
            },
          },
          { $sort: { commentCount: -1, publishedAt: -1 } },
          { $skip: skip },
          { $limit: pageSize },
        ]);

        const total = await this.rutinaModel.countDocuments({ deleted: false });

        this.logger.log(
          `Rutinas listadas (más comentadas): ${commentedResults.length} de ${total} totales`,
        );
        return {
          routines: commentedResults,
          total,
          page: pageNum,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      }

      if (sort === 'mostVoted') {
        const votedResults = await this.rutinaModel.aggregate([
          { $match: { deleted: false } },
          {
            $addFields: {
              upvoteCount: { $size: { $ifNull: ['$upvotes', []] } },
              downvoteCount: { $size: { $ifNull: ['$downvotes', []] } },
              netVotes: {
                $subtract: [
                  { $size: { $ifNull: ['$upvotes', []] } },
                  { $size: { $ifNull: ['$downvotes', []] } },
                ],
              },
            },
          },
          { $sort: { netVotes: -1, publishedAt: -1 } },
          { $skip: skip },
          { $limit: pageSize },
        ]);

        const total = await this.rutinaModel.countDocuments({ deleted: false });

        this.logger.log(
          `Rutinas listadas (más votadas): ${votedResults.length} de ${total} totales`,
        );
        return {
          routines: votedResults,
          total,
          page: pageNum,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      }

      const routines = await this.rutinaModel
        .find({ deleted: false })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .exec();

      const total = await this.rutinaModel.countDocuments({ deleted: false });

      this.logger.log(
        `Rutinas listadas (más recientes): ${routines.length} de ${total} totales`,
      );
      return {
        routines,
        total,
        page: pageNum,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      this.logger.error(
        `Error al listar rutinas: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByUserId(userId: string, page: number = 1) {
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    this.logger.log(`Buscando rutinas para usuario ${userId}, página ${page}`);

    try {
      const routines = await this.rutinaModel
        .find({ userId, deleted: false })
        .sort({ views: -1 })
        .skip(skip)
        .limit(pageSize)
        .exec();

      const total = await this.rutinaModel.countDocuments({
        userId,
        deleted: false,
      });

      this.logger.log(
        `Rutinas encontradas para usuario ${userId}: ${routines.length} de ${total} totales`,
      );
      return {
        routines,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      this.logger.error(
        `Error al buscar rutinas del usuario ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string) {
    this.logger.log(`Consultando rutina con ID: ${id}`);
    try {
      const rutina = await this.rutinaModel
        .findOne({ _id: id, deleted: false })
        .exec();
      if (!rutina) {
        this.logger.warn(`Rutina no encontrada con ID: ${id}`);
      }
      return rutina;
    } catch (error) {
      this.logger.error(
        `Error al consultar rutina ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(id: string, updateRutinaDto: UpdateRutinaDto) {
    this.logger.log(
      `Actualizando rutina ${id}: ${JSON.stringify(updateRutinaDto)}`,
    );
    try {
      const updated = await this.rutinaModel
        .findByIdAndUpdate(id, updateRutinaDto, { returnDocument: 'after' })
        .exec();
      if (updated) {
        this.logger.log(`Rutina ${id} actualizada exitosamente`);
      } else {
        this.logger.warn(`Rutina no encontrada para actualizar: ${id}`);
      }
      return updated;
    } catch (error) {
      this.logger.error(
        `Error al actualizar rutina ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async softDelete(id: string) {
    this.logger.log(`Marcando rutina ${id} como eliminada (borrado lógico)`);
    try {
      const deleted = await this.rutinaModel
        .findByIdAndUpdate(id, { deleted: true }, { returnDocument: 'after' })
        .exec();

      if (deleted) {
        await this.userModel
          .findByIdAndUpdate(deleted.userId, {
            $pull: { createdRoutineIds: id },
          })
          .exec();
        this.logger.log(`Rutina ${id} marcada como eliminada`);
      } else {
        this.logger.warn(`Rutina no encontrada para eliminar: ${id}`);
      }
      return deleted;
    } catch (error) {
      this.logger.error(
        `Error al eliminar rutina ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async hardDelete(id: string) {
    this.logger.log(`Eliminando rutina ${id} permanentemente (borrado físico)`);
    try {
      const deleted = await this.rutinaModel.findByIdAndDelete(id).exec();
      if (deleted) {
        this.logger.log(`Rutina ${id} eliminada permanentemente`);
      } else {
        this.logger.warn(
          `Rutina no encontrada para eliminar permanentemente: ${id}`,
        );
      }
      return deleted;
    } catch (error) {
      this.logger.error(
        `Error al eliminar permanentemente rutina ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async upvote(id: string, userId: string) {
    this.logger.log(`Voto positivo de usuario ${userId} en rutina ${id}`);
    try {
      const rutina = await this.rutinaModel.findById(id).exec();
      if (!rutina) {
        this.logger.warn(`Rutina no encontrada para voto positivo: ${id}`);
        return null;
      }

      if (!rutina.upvotes) rutina.upvotes = [];
      if (!rutina.downvotes) rutina.downvotes = [];

      const upvoteIndex = rutina.upvotes.indexOf(userId);
      const downvoteIndex = rutina.downvotes.indexOf(userId);

      if (upvoteIndex > -1) {
        rutina.upvotes.splice(upvoteIndex, 1);
        this.logger.log(
          `Usuario ${userId} retiró voto positivo de rutina ${id}`,
        );
      } else {
        rutina.upvotes.push(userId);
        if (downvoteIndex > -1) {
          rutina.downvotes.splice(downvoteIndex, 1);
          this.logger.log(
            `Usuario ${userId} cambió voto negativo a positivo en rutina ${id}`,
          );
        } else {
          this.logger.log(`Usuario ${userId} votó positivamente rutina ${id}`);
        }
      }

      return await rutina.save();
    } catch (error) {
      this.logger.error(
        `Error al registrar voto positivo en rutina ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async downvote(id: string, userId: string) {
    this.logger.log(`Voto negativo de usuario ${userId} en rutina ${id}`);
    try {
      const rutina = await this.rutinaModel.findById(id).exec();
      if (!rutina) {
        this.logger.warn(`Rutina no encontrada para voto negativo: ${id}`);
        return null;
      }

      if (!rutina.upvotes) rutina.upvotes = [];
      if (!rutina.downvotes) rutina.downvotes = [];

      const downvoteIndex = rutina.downvotes.indexOf(userId);
      const upvoteIndex = rutina.upvotes.indexOf(userId);

      if (downvoteIndex > -1) {
        rutina.downvotes.splice(downvoteIndex, 1);
        this.logger.log(
          `Usuario ${userId} retiró voto negativo de rutina ${id}`,
        );
      } else {
        rutina.downvotes.push(userId);
        if (upvoteIndex > -1) {
          rutina.upvotes.splice(upvoteIndex, 1);
          this.logger.log(
            `Usuario ${userId} cambió voto positivo a negativo en rutina ${id}`,
          );
        } else {
          this.logger.log(`Usuario ${userId} votó negativamente rutina ${id}`);
        }
      }

      return await rutina.save();
    } catch (error) {
      this.logger.error(
        `Error al registrar voto negativo en rutina ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async removeUpvote(id: string, userId: string) {
    this.logger.log(
      `Removiendo voto positivo de usuario ${userId} en rutina ${id}`,
    );
    try {
      const rutina = await this.rutinaModel.findById(id).exec();
      if (!rutina) {
        this.logger.warn(
          `Rutina no encontrada para remover voto positivo: ${id}`,
        );
        return null;
      }

      if (!rutina.upvotes) rutina.upvotes = [];

      const upvoteIndex = rutina.upvotes.indexOf(userId);
      if (upvoteIndex > -1) {
        rutina.upvotes.splice(upvoteIndex, 1);
        this.logger.log(
          `Voto positivo de usuario ${userId} removido de rutina ${id}`,
        );
      } else {
        this.logger.log(
          `Usuario ${userId} no tenía voto positivo en rutina ${id}`,
        );
      }

      return await rutina.save();
    } catch (error) {
      this.logger.error(
        `Error al remover voto positivo de rutina ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async removeDownvote(id: string, userId: string) {
    this.logger.log(
      `Removiendo voto negativo de usuario ${userId} en rutina ${id}`,
    );
    try {
      const rutina = await this.rutinaModel.findById(id).exec();
      if (!rutina) {
        this.logger.warn(
          `Rutina no encontrada para remover voto negativo: ${id}`,
        );
        return null;
      }

      if (!rutina.downvotes) rutina.downvotes = [];

      const downvoteIndex = rutina.downvotes.indexOf(userId);
      if (downvoteIndex > -1) {
        rutina.downvotes.splice(downvoteIndex, 1);
        this.logger.log(
          `Voto negativo de usuario ${userId} removido de rutina ${id}`,
        );
      } else {
        this.logger.log(
          `Usuario ${userId} no tenía voto negativo en rutina ${id}`,
        );
      }

      return await rutina.save();
    } catch (error) {
      this.logger.error(
        `Error al remover voto negativo de rutina ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async incrementView(id: string) {
    this.logger.debug(`Registrando visualización para rutina ${id}`);
    try {
      const updated = await this.rutinaModel
        .findByIdAndUpdate(
          id,
          { $inc: { views: 1 } },
          { returnDocument: 'after' },
        )
        .exec();
      if (updated) {
        this.logger.debug(
          `Visualización registrada: rutina ${id} tiene ahora ${updated.views} visualizaciones`,
        );
      }
      return updated;
    } catch (error) {
      this.logger.error(
        `Error al registrar visualización de rutina ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getVoteCounts(id: string) {
    this.logger.debug(`Obteniendo conteo de votos para rutina ${id}`);
    try {
      const rutina = await this.rutinaModel.findById(id).exec();
      if (!rutina) {
        this.logger.warn(`Rutina no encontrada para conteo de votos: ${id}`);
        return null;
      }

      const counts = {
        upvotes: rutina.upvotes?.length || 0,
        downvotes: rutina.downvotes?.length || 0,
        views: rutina.views || 0,
      };
      this.logger.debug(
        `Conteo de votos para rutina ${id}: ${JSON.stringify(counts)}`,
      );
      return counts;
    } catch (error) {
      this.logger.error(
        `Error al obtener conteo de votos de rutina ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getComments(rutinaId: string) {
    this.logger.log(`Obteniendo comentarios de rutina ${rutinaId}`);
    try {
      return await this.comentarioModel
        .find({ rutinaId })
        .populate('userId', 'nombre avatarUrl')
        .exec();
    } catch (error) {
      this.logger.error(
        `Error al obtener comentarios de rutina ${rutinaId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async addComment(rutinaId: string, userId: string, comment: string) {
    this.logger.log(
      `Agregando comentario de usuario ${userId} en rutina ${rutinaId}`,
    );
    try {
      const newComment = new this.comentarioModel({
        rutinaId,
        userId,
        comment,
      });
      return await newComment.save();
    } catch (error) {
      this.logger.error(
        `Error al agregar comentario en rutina ${rutinaId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
