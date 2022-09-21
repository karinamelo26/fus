import { Class } from 'type-fest';

import { Controller } from '../../api/controller';
import { InternalServerErrorException } from '../../api/exception';
import { ModuleResolver } from '../../api/module-resolver';
import { Injectable } from '../../di/injectable';

import { DocsControllerViewModel } from './view-model/docs-controller.view-model';
import { DocsMethodViewModel } from './view-model/docs-method.view-model';

@Injectable({ global: true })
export class DocsService {
  constructor(private readonly moduleResolver: ModuleResolver) {}

  private _resolveController(controller: Class<any>): DocsControllerViewModel {
    const metadata = Controller.getMetadata(controller);
    if (!metadata) {
      throw new InternalServerErrorException(`Metadata not found for ${controller.name}`);
    }
    const methods: DocsMethodViewModel[] = [];
    for (const [, methodMetadata] of metadata.methods) {
      methods.push({
        path: `${metadata.path}/${methodMetadata.path}`,
        responses: [],
      });
    }
    return {
      name: controller.name.replace(/Controller$/, ''),
      path: metadata.path,
      methods,
    };
  }

  async getAll(): Promise<DocsControllerViewModel[]> {
    const controllers = this.moduleResolver.getControllers();
    return controllers.map((controller) => this._resolveController(controller));
  }
}
