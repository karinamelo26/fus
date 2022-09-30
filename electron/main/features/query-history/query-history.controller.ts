import { Controller } from '../../api/controller';
import { Data } from '../../api/data';
import { Method } from '../../api/method';

import { GenerateMockDataDto } from './dto/generate-mock-data.dto';
import { QueryHistoryService } from './query-history.service';

@Controller('query-history', { summary: 'Query history' })
export class QueryHistoryController {
  constructor(private readonly queryHistoryService: QueryHistoryService) {}

  @Method('generate-mock-data', {
    summary: 'Generate mock data',
    okResponse: { example: () => undefined },
  })
  async generateMockData(@Data() dto: GenerateMockDataDto): Promise<void> {
    await this.queryHistoryService.generateMockData(dto);
  }
}
