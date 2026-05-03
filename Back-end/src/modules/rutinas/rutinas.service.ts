import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRutinaDto } from './dto/create-rutina.dto';
import { UpdateRutinaDto } from './dto/update-rutina.dto';
import { Rutina } from './entities/rutina.entity';

@Injectable()
export class RutinasService {
  constructor(
    @InjectModel('Rutina') private readonly rutinaModel: Model<Rutina>,
  ) {}

  async create(createRutinaDto: CreateRutinaDto) {
    const newRutina = new this.rutinaModel({
      ...createRutinaDto,
      views: 0,
      deleted: false,
      upvotes: [],
      downvotes: [],
    });
    return await newRutina.save();
  }

  async findAll(page?: number) {
    const pageSize = 20;
    const pageNum = page ? Math.max(1, page) : 1;
    const skip = (pageNum - 1) * pageSize;

    const routines = await this.rutinaModel
      .find({ deleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .exec();

    const total = await this.rutinaModel.countDocuments({ deleted: false });

    return {
      routines,
      total,
      page: pageNum,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findByUserId(userId: string, page: number = 1) {
    const pageSize = 20;
    const skip = (page - 1) * pageSize;
    
    const routines = await this.rutinaModel
      .find({ userId, deleted: false })
      .sort({ views: -1 })
      .skip(skip)
      .limit(pageSize)
      .exec();

    const total = await this.rutinaModel.countDocuments({ userId, deleted: false });

    return {
      routines,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    return await this.rutinaModel.findOne({ _id: id, deleted: false }).exec();
  }

  async update(id: string, updateRutinaDto: UpdateRutinaDto) {
    return await this.rutinaModel
      .findByIdAndUpdate(id, updateRutinaDto, { new: true })
      .exec();
  }

  async softDelete(id: string) {
    return await this.rutinaModel
      .findByIdAndUpdate(id, { deleted: true }, { new: true })
      .exec();
  }

  async hardDelete(id: string) {
    return await this.rutinaModel.findByIdAndDelete(id).exec();
  }

  async upvote(id: string, userId: string) {
    const rutina = await this.rutinaModel.findById(id).exec();
    if (!rutina) return null;

    if (!rutina.upvotes) rutina.upvotes = [];
    if (!rutina.downvotes) rutina.downvotes = [];

    const upvoteIndex = rutina.upvotes.indexOf(userId);
    const downvoteIndex = rutina.downvotes.indexOf(userId);

    if (upvoteIndex > -1) {
      rutina.upvotes.splice(upvoteIndex, 1);
    } else {
      rutina.upvotes.push(userId);
      if (downvoteIndex > -1) {
        rutina.downvotes.splice(downvoteIndex, 1);
      }
    }

    return await rutina.save();
  }

  async downvote(id: string, userId: string) {
    const rutina = await this.rutinaModel.findById(id).exec();
    if (!rutina) return null;

    if (!rutina.upvotes) rutina.upvotes = [];
    if (!rutina.downvotes) rutina.downvotes = [];

    const downvoteIndex = rutina.downvotes.indexOf(userId);
    const upvoteIndex = rutina.upvotes.indexOf(userId);

    if (downvoteIndex > -1) {
      rutina.downvotes.splice(downvoteIndex, 1);
    } else {
      rutina.downvotes.push(userId);
      if (upvoteIndex > -1) {
        rutina.upvotes.splice(upvoteIndex, 1);
      }
    }

    return await rutina.save();
  }

  async removeUpvote(id: string, userId: string) {
    const rutina = await this.rutinaModel.findById(id).exec();
    if (!rutina) return null;

    if (!rutina.upvotes) rutina.upvotes = [];

    const upvoteIndex = rutina.upvotes.indexOf(userId);
    if (upvoteIndex > -1) {
      rutina.upvotes.splice(upvoteIndex, 1);
    }

    return await rutina.save();
  }

  async removeDownvote(id: string, userId: string) {
    const rutina = await this.rutinaModel.findById(id).exec();
    if (!rutina) return null;

    if (!rutina.downvotes) rutina.downvotes = [];

    const downvoteIndex = rutina.downvotes.indexOf(userId);
    if (downvoteIndex > -1) {
      rutina.downvotes.splice(downvoteIndex, 1);
    }

    return await rutina.save();
  }

  async incrementView(id: string) {
    return await this.rutinaModel
      .findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .exec();
  }

  async getVoteCounts(id: string) {
    const rutina = await this.rutinaModel.findById(id).exec();
    if (!rutina) return null;

    return {
      upvotes: rutina.upvotes?.length || 0,
      downvotes: rutina.downvotes?.length || 0,
      views: rutina.views || 0,
    };
  }
}
