import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryModelsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  labs?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRating?: number;

  @IsOptional()
  @IsString()
  @IsIn(['rating', 'price-asc', 'price-desc', 'name'])
  @Transform(({ value }: { value: string }) => value ?? 'rating')
  sortBy?: string = 'rating';
}
