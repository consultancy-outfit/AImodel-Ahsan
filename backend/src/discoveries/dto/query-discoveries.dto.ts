import { IsOptional, IsString } from 'class-validator';

export class QueryDiscoveriesDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
