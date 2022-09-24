import { DocsStateSelectors, useDocsState } from './docs.state';
import { useEffect } from 'react';
import { Typography } from '@mui/material';
import { For } from '../../components/For';
import { DocsController } from './components/DocsController';
import { DocsControl } from './components/DocsControl';
import { useRecoilValue } from 'recoil';
import { useDocsService } from './docs.service';

export function Docs() {
  const { getAll } = useDocsService();
  const { setControllers } = useDocsState();
  const controllers = useRecoilValue(DocsStateSelectors.getControllers);

  async function fetchDocs() {
    // Se já tiver carregado os docs, não carrega de novo
    if (controllers.length) {
      return;
    }
    const _controllers = await getAll();
    setControllers(_controllers);
  }

  useEffect(() => {
    fetchDocs();
  }, []);

  return (
    <div>
      <div>
        <Typography variant="h5">API Documentation</Typography>
      </div>
      <DocsControl></DocsControl>
      <For each={controllers} trackBy="path">
        {(controller) => <DocsController controller={controller}></DocsController>}
      </For>
    </div>
  );
}
