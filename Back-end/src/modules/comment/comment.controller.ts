import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentDto } from '../../common/dtos/product.dto';
import {
  CommentCreateDto,
  CommentUpdateDto,
} from '../../common/dtos/comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  getAllComments(): CommentDto[] {
    return this.commentService.getAll();
  }

  @Get(':id')
  getCommentById(@Param('id') id: string): CommentDto | undefined {
    return this.commentService.getById(id);
  }

  @Post()
  createComment(@Body() commentCreateDto: CommentCreateDto): CommentDto {
    return this.commentService.create(commentCreateDto);
  }

  @Put(':id')
  updateComment(
    @Param('id') id: string,
    @Body() commentUpdateDto: CommentUpdateDto,
  ): CommentDto | undefined {
    return this.commentService.update(id, commentUpdateDto);
  }

  @Delete(':id')
  deleteComment(@Param('id') id: string): { success: boolean } {
    const success = this.commentService.delete(id);
    return { success };
  }

  @Post(':id/upvote/:userId')
  upvoteComment(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): CommentDto | undefined {
    return this.commentService.addUpvote(id, userId);
  }

  @Post(':id/downvote/:userId')
  downvoteComment(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): CommentDto | undefined {
    return this.commentService.addDownvote(id, userId);
  }

  @Delete(':id/upvote/:userId')
  removeUpvote(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): CommentDto | undefined {
    return this.commentService.removeUpvote(id, userId);
  }

  @Delete(':id/downvote/:userId')
  removeDownvote(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): CommentDto | undefined {
    return this.commentService.removeDownvote(id, userId);
  }
}
