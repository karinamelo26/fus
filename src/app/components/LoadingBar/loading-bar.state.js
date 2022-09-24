import { atom, selector, useSetRecoilState } from 'recoil';
import { StateKeysEnum } from '../../routes/shared/state/keys.enum';

const state = atom({
  key: StateKeysEnum.loadingBar,
  default: {
    loading: 0,
  },
});

export function useLoadingState() {
  const setState = useSetRecoilState(state);

  const showLoading = () => {
    setState((loadingState) => ({ ...loadingState, loading: loadingState.loading + 1 }));
  };

  const hideLoading = () => {
    setState((loadingState) => ({
      ...loadingState,
      loading: Math.max(loadingState.loading - 1, 0),
    }));
  };

  return {
    showLoading,
    hideLoading,
  };
}

export const LoadingBarStateSelectors = {
  getLoading: selector({
    key: `${StateKeysEnum.loadingBar}_Selectors_getLoading`,
    get: ({ get }) => !!get(state).loading,
  }),
};
