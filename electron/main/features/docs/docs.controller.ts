import { Controller } from '../../api/controller';
import { Method } from '../../api/method';

import { DocsService } from './docs.service';
import { DocsControllerViewModel } from './view-model/docs-controller.view-model';

@Controller('docs')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Method('get-all')
  async getAll(): Promise<DocsControllerViewModel[]> {
    return this.docsService.getAll();
  }
}
