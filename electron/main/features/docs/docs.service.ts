import { getReasonPhrase } from 'http-status-codes';
import { isNotNil } from 'st-utils';
import { Class } from 'type-fest';

import { Controller } from '../../api/controller';
import { InternalServerErrorException } from '../../api/exception';
import { fromModelToExample } from '../../api/from-model-to-example';
import { ModuleResolver } from '../../api/module-resolver';
import { Injectable } from '../../di/injectable';

import { fromPathToMethodAction } from './from-path-to-method-action';
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
      const parameterMetadata = methodMetadata.parameters.find(isNotNil);
      methods.push({
        controllerPath: metadata.path,
        path: `${metadata.path}/${methodMetadata.path}`,
        responses: (methodMetadata.responses ?? []).map((response) => ({
          status: response.status,
          statusMessage: getReasonPhrase(response.status),
          example: response.example
            ? response.example()
            : fromModelToExample(response.data?.(), { isArray: response.isArray }),
        })),
        summary: methodMetadata.summary,
        description: methodMetadata.description,
        request: fromModelToExample(parameterMetadata?.type, {
          isArray: parameterMetadata?.isArray,
        }),
        action: fromPathToMethodAction(methodMetadata.path),
      });
    }
    return {
      name: controller.name.replace(/Controller$/, ''),
      path: metadata.path,
      methods,
      summary: metadata.summary,
    };
  }

  async getAll(): Promise<DocsControllerViewModel[]> {
    const controllers = this.moduleResolver.getControllers();
    return controllers.map((controller) => this._resolveController(controller));
  }
}
