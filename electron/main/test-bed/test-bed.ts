import { Class } from 'type-fest';

import { Module, ModuleOptions } from '../api/module';
import { ModuleResolver } from '../api/module-resolver';
import { InjectionToken } from '../di/injection-token';
import { Injector } from '../di/injector';

import { TestBedInjector } from './test-bed-injector';

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
    class TestModule {}
    Module(options)(TestModule);
    this.moduleResolver = await ModuleResolver.create(this.injector, TestModule).resolveAll();
  }
}
