import { Injectable } from '@nestjs/common';
import { CommentDto } from '../../common/dtos/product.dto';
import {
  CommentCreateDto,
  CommentUpdateDto,
} from '../../common/dtos/comment.dto';
import { MOCK_COMMENTS } from './comment.data';

@Injectable()
export class CommentService {
  private comments: CommentDto[] = MOCK_COMMENTS;
  private nextId = 4;

  getAll(): CommentDto[] {
    return this.comments;
  }

  getById(id: string): CommentDto | undefined {
    return this.comments.find((comment) => comment.id === id);
  }

  create(commentCreateDto: CommentCreateDto): CommentDto {
    const newComment: CommentDto = {
      id: `c${this.nextId++}`,
      ...commentCreateDto,
      createdAt: new Date().toISOString(),
      upvotes: [],
      downvotes: [],
    };

    this.comments.push(newComment);
    return newComment;
  }

  update(
    id: string,
    commentUpdateDto: CommentUpdateDto,
  ): CommentDto | undefined {
    const comment = this.getById(id);
    if (!comment) {
      return undefined;
    }

    Object.assign(comment, commentUpdateDto);
    return comment;
  }

  delete(id: string): boolean {
    const index = this.comments.findIndex((comment) => comment.id === id);
    if (index === -1) {
      return false;
    }

    this.comments.splice(index, 1);
    return true;
  }

  addUpvote(commentId: string, userId: string): CommentDto | undefined {
    const comment = this.getById(commentId);
    if (!comment) {
      return undefined;
    }

    if (!comment.upvotes.includes(userId)) {
      comment.upvotes.push(userId);
      comment.downvotes = comment.downvotes.filter((id) => id !== userId);
    }

    return comment;
  }

  addDownvote(commentId: string, userId: string): CommentDto | undefined {
    const comment = this.getById(commentId);
    if (!comment) {
      return undefined;
    }

    if (!comment.downvotes.includes(userId)) {
      comment.downvotes.push(userId);
      comment.upvotes = comment.upvotes.filter((id) => id !== userId);
    }

    return comment;
  }

  removeUpvote(commentId: string, userId: string): CommentDto | undefined {
    const comment = this.getById(commentId);
    if (!comment) {
      return undefined;
    }

    comment.upvotes = comment.upvotes.filter((id) => id !== userId);
    return comment;
  }

  removeDownvote(commentId: string, userId: string): CommentDto | undefined {
    const comment = this.getById(commentId);
    if (!comment) {
      return undefined;
    }

    comment.downvotes = comment.downvotes.filter((id) => id !== userId);
    return comment;
  }
}
