import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  // enableImplicitConversion: true, para que convierta el string a number en el main.ts
  @Type(() => Number) // tambien se puede hacer de manera global en el main.ts con app.useGlobalPipes(new ValidationPipe({ transform: true }));
  limit?: number;
  @IsOptional()
  @IsPositive()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
