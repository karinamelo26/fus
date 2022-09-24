import { normalizeString, orderBy } from 'st-utils';
import { atom, selector, useSetRecoilState } from 'recoil';
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
  const setDocs = useSetRecoilState(state);

  const updateController = (path, partial) => {
    setDocs((docs) => ({
      ...docs,
      controllers: arrayUtil(docs.controllers, 'path').update(path, partial).toArray(),
    }));
  };

  const updateMethod = (controller, method, partial) => {
    updateController(controller, (_controller) => ({
      ..._controller,
      methods: arrayUtil(_controller.methods, 'path').update(method, partial).toArray(),
    }));
  };

  const setControllers = (controllers) =>
    setDocs((docs) => ({
      ...docs,
      controllers: controllers.map((controller) => ({
        ...controller,
        methods: controller.methods.map((method) => ({ ...method, collapsed: true })),
      })),
    }));

  return {
    setControllers,
    updateController,
    updateMethod,
    setTerm: (_term) => setDocs((docs) => ({ ...docs, term: _term })),
    setOrderByDirection: (_orderByDirection) =>
      setDocs((docs) => ({ ...docs, orderByDirection: _orderByDirection })),
  };
}

function normalizeSearch(str) {
  return normalizeString(str).toLowerCase().trim();
}

const searchFnsMethods = [(method) => method.path, (method) => method.description];

export const DocsStateSelectors = {
  getControllers: selector({
    key: `${StateKeysEnum.docs}_Selectors_getControllers`,
    get: ({ get }) => {
      let { controllers, orderByDirection, term } = get(state);
      term = normalizeString(term).toLowerCase().trim();
      if (term) {
        controllers = controllers
          .map((controller) => ({
            ...controller,
            methods: controller.methods.filter((method) =>
              searchFnsMethods.some((searchFn) =>
                normalizeSearch(searchFn(method)).includes(term)
              )
            ),
          }))
          .filter((controller) => controller.methods.length);
      }

      if (orderByDirection) {
        controllers = orderBy(controllers, 'name', orderByDirection);
      }

      return controllers;
    },
  }),
  getOrderByDirection: selector({
    key: `${StateKeysEnum.docs}_Selectors_getOrderByDirection`,
    get: ({ get }) => get(state).orderByDirection,
  }),
  getTerm: selector({
    key: `${StateKeysEnum.docs}_Selectors_getTerm`,
    get: ({ get }) => get(state).term,
  }),
};
