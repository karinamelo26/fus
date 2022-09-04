import { Injector } from '../di/injector';

export class TestBedInjector extends Injector {
  override async resolveAll(): Promise<this> {
    return super.resolveAll(true);
  }

  static override create(): TestBedInjector {
    return new TestBedInjector();
  }
}
