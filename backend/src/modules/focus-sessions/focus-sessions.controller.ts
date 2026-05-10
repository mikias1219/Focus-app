import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FocusSessionsService } from './focus-sessions.service';

@UseGuards(JwtAuthGuard)
@Controller('focus-sessions')
export class FocusSessionsController {
  constructor(private readonly service: FocusSessionsService) {}

  @Get('active')
  active(@CurrentUser() user: { sub: string }) {
    return this.service.active(user.sub);
  }

  @Post('start')
  start(@CurrentUser() user: { sub: string }, @Body() body: { taskId: string }) {
    return this.service.start(user.sub, body.taskId);
  }

  @Post(':id/stop')
  stop(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.service.stop(user.sub, id);
  }
}
