import { useApi } from '../../api/api';

export function useDocsService() {
  const api = useApi();

  const getAll = () =>
    api('docs/get-all', {}).then((controllers) =>
      controllers.map((controller) => ({
        ...controller,
        methods: controller.methods.map((method) => ({
          ...method,
          request: JSON.stringify(method.request, null, 4),
          responses: method.responses.map((response) => ({
            ...response,
            example: JSON.stringify(response.example, null, 4),
          })),
        })),
      }))
    );

  return {
    getAll,
  };
}
