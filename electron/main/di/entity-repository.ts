import { Class } from 'type-fest';

interface EntityRepository {
  (entity: Class<any>): ClassDecorator;
  getMetadata(target: any): Class<any> | null;
  setMetadata(target: any, entity: Class<any>): void;
  getAll(): Class<any>[];
}

const storeMetadata = new Map<any, Class<any>>();

const getMetadata: EntityRepository['getMetadata'] = target => storeMetadata.get(target) ?? null;
const setMetadata: EntityRepository['setMetadata'] = (target, entity) => {
  storeMetadata.set(target, entity);
};
const getAll: EntityRepository['getAll'] = () => [...storeMetadata.values()];

function EntityRepositoryInternal(entity: Class<any>): ClassDecorator {
  return target => {
    setMetadata(target, entity);
  };
}

export const EntityRepository: EntityRepository = Object.assign(EntityRepositoryInternal, {
  setMetadata,
  getMetadata,
  getAll,
});
