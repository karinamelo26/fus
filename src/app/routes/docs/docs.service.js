import { useApi } from '../../api/api';

export function useDocsService() {
  const api = useApi();

  const getAll = () => api('docs/get-all', {});

  return {
    getAll,
  };
}
