import { PartialType } from '@nestjs/swagger';
import { RegisterDto } from './resgister-user.dto';

export class UpdateUserDto extends PartialType(RegisterDto) {}