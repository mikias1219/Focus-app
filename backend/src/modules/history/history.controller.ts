import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HistoryQueryDto } from './dto/history-query.dto';
import { HistoryService } from './history.service';

@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly service: HistoryService) {}

  @Get()
  getHistory(
    @CurrentUser() user: { sub: string },
    @Query() query: HistoryQueryDto,
  ) {
    return this.service.getHistory(user.sub, query);
  }
}
