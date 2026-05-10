import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { DistractionType } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DistractionsService } from './distractions.service';

@UseGuards(JwtAuthGuard)
@Controller('distractions')
export class DistractionsController {
  constructor(private readonly service: DistractionsService) {}

  @Post()
  create(
    @CurrentUser() user: { sub: string },
    @Body() body: { sessionId: string; type: DistractionType },
  ) {
    return this.service.create(user.sub, body.sessionId, body.type);
  }
}
