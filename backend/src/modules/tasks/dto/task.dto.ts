import { Priority, TaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title!: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
  @IsInt()
  @Min(1)
  @Type(() => Number)
  estimatedMinutes!: number;
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  estimatedMinutes?: number;
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export type TaskPeriod = 'day' | 'week' | 'month' | 'all';

export class ListTasksQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsIn(['day', 'week', 'month', 'all'])
  period?: TaskPeriod;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}
