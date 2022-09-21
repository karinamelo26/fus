import { useDocsState } from './docs.state';
import { api } from '../../api/api';
import { useEffect } from 'react';
import { Typography } from '@mui/material';
import { For } from '../../components/For';
import { DocsController } from './components/DocsController';
import { DocsControl } from './components/DocsControl';

export function Docs() {
  const { controllers, setControllers } = useDocsState();

  async function fetchDocs() {
    const _controllers = await api('docs/get-all', {});
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
