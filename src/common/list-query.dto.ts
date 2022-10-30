import { IsNumberString, IsOptional } from 'class-validator';

export class ListQueryDto {
    @IsNumberString()
    @IsOptional()
    page?: number;

    @IsNumberString()
    @IsOptional()
    perPage?: number;
}