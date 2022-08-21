import styles from '@styles/app.module.scss';
import { api } from './api/api';
import { Button, List, ListItemButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { Show } from './components/Show';
import { useState } from 'react';
import { For } from './components/For';
import { random } from 'st-utils';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const App = () => {
  const query = useQuery(['schedules'], () =>
    wait(random(500, 2500)).then(() => api('schedule/get-all', { active: true }))
  );

  const [idScheduleSelected, setIdScheduleSelected] = useState();

  async function set() {
    if (!idScheduleSelected) {
      return;
    }
    await api('schedule/execute', { idSchedule: idScheduleSelected });
  }

  return (
    <div className={styles.app}>
      <Button variant={'contained'} onClick={() => set()}>
        Teste
      </Button>
      <Delete></Delete>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium amet aspernatur eligendi esse ipsam
      molestias necessitatibus provident quis sint sit. Alias culpa inventore laborum odio perferendis totam velit
      voluptas voluptates.
      <div>
        <Show when={query} fallback={'Loading...'}>
          {resolved => (
            <List>
              <For each={resolved.data} trackBy="idSchedule">
                {(item, options) => (
                  <ListItemButton
                    selected={item.idSchedule === idScheduleSelected}
                    onClick={() => setIdScheduleSelected(item.idSchedule)}
                  >
                    {item.name} - {JSON.stringify(options)}
                  </ListItemButton>
                )}
              </For>
            </List>
          )}
        </Show>
      </div>
    </div>
  );
};
