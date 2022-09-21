import { arraySearch, orderBy } from 'st-utils';
import { atom, useRecoilState } from 'recoil';
import { StateKeysEnum } from '../shared/state/keys.enum';
import { arrayUtil } from 'st-utils/src/array-util';

const state = atom({
  key: StateKeysEnum.docs,
  default: {
    controllers: [],
    orderByDirection: 'asc',
    term: '',
  },
});

export function useDocsState() {
  let [{ controllers, orderByDirection, term }, setDocs] = useRecoilState(state);

  function updateDocs(update) {
    setDocs((docs) => update(docs));
  }

  if (term) {
    controllers = arraySearch(controllers, ['name', 'path'], term);
  }

  if (orderByDirection) {
    controllers = orderBy(controllers, 'name', orderByDirection);
  }

  const updateController = (name, partial) => {
    setDocs((docs) => ({
      ...docs,
      controllers: arrayUtil(docs.controllers, 'name').update(name, partial).toArray(),
    }));
  };

  return {
    controllers,
    orderByDirection,
    term,
    setControllers: (_controllers) => updateDocs((docs) => ({ ...docs, controllers: _controllers })),
    updateController,
    setTerm: (_term) => updateDocs((docs) => ({ ...docs, term: _term })),
    setOrderByDirection: (_orderByDirection) =>
      updateDocs((docs) => ({ ...docs, orderByDirection: _orderByDirection })),
  };
}
