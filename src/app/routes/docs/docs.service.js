import { useApi } from '../../api/api';

export function useDocsService() {
  const api = useApi();

  const getAll = () =>
    api('docs/get-all', {}).then((controllers) =>
      controllers.map((controller) => ({
        ...controller,
        methods: controller.methods.map((method) => {
          const request = JSON.stringify(method.request, null, 4);
          return {
            ...method,
            request,
            requestEditable: request,
            responses: method.responses.map((response) => ({
              ...response,
              example: JSON.stringify(response.example, null, 4),
            })),
          };
        }),
      }))
    );

  return {
    getAll,
  };
}
