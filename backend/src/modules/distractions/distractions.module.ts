import { Module } from '@nestjs/common';
import { DistractionsController } from './distractions.controller';
import { DistractionsService } from './distractions.service';

@Module({
  controllers: [DistractionsController],
  providers: [DistractionsService],
})
export class DistractionsModule {}
