import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/api';
import { Show } from '../../components/Show';
import { For } from '../../components/For';
import { DocsController } from './components/DocsController';

export function Docs() {
  const docsQuery = useQuery(['docs'], () => api('docs/get-all', {}));

  return (
    <Show when={docsQuery}>
      {(controllers) => (
        <For each={controllers} trackBy="path">
          {(controller) => <DocsController controller={controller}></DocsController>}
        </For>
      )}
    </Show>
  );
}
