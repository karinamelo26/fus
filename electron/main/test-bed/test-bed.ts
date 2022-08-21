import { Class } from 'type-fest';

import { ModuleOptions } from '../api/module';
import { ModuleResolver } from '../api/module-resolver';
import { InjectionToken } from '../di/injection-token';
import { Injector } from '../di/injector';

export class TestBedInjector extends Injector {
  override async resolveAll(): Promise<this> {
    return super.resolveAll(true);
  }

  static override create(): TestBedInjector {
    return new TestBedInjector();
  }
}

export class TestBed {
  static injector: Injector;
  static moduleResolver: ModuleResolver;

  static get<T>(target: InjectionToken<T>): T;
  static get<T>(target: Class<T>): T;
  static get<T>(target: any): T {
    return this.injector.get(target);
  }

  static async configureTestingModule(options: ModuleOptions): Promise<void> {
    this.injector = TestBedInjector.create();
    this.moduleResolver = await ModuleResolver.createTest(this.injector, options).resolveAll();
  }
}
