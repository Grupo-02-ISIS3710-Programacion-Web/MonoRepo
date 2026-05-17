import { IsEmail, IsString, MinLength } from "class-validator";

export class GetInUserDto {

    @IsEmail()
    email: String;

    @IsString()
    @MinLength(6)
    password: String;


}