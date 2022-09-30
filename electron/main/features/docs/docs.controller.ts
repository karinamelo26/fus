import { Controller } from '../../api/controller';
import { Method } from '../../api/method';

import { DocsService } from './docs.service';
import { DocsControllerViewModel } from './view-model/docs-controller.view-model';

@Controller('docs', { summary: 'API Documentation' })
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Method('get-all', {
    summary: 'Get all API Documentation information',
    okResponse: { data: () => DocsControllerViewModel, isArray: true },
  })
  async getAll(): Promise<DocsControllerViewModel[]> {
    return this.docsService.getAll();
  }
}
