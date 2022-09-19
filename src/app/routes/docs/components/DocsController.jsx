import { For } from '../../../components/For';
import { DocsMethod } from './DocsMethod';

export function DocsController({ controller }) {
  return (
    <div>
      <header>
        <div>{controller.name}</div>
        <div>Icon to collapse</div>
      </header>
      <main>
        <For each={controller.methods} trackBy="path">
          {(method) => <DocsMethod method={method}></DocsMethod>}
        </For>
      </main>
    </div>
  );
}
