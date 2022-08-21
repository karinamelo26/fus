import styles from '@styles/app.module.scss';
import { api } from './api/api';
import { Button } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';

export const App = () => {
  const { data, isLoading } = useQuery(['schedules'], () => api('schedule/get-all', { active: true }));

  async function set() {
    if (isLoading) {
      return;
    }
    await api('schedule/execute', { idSchedule: data.data[0].idSchedule });
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
    </div>
  );
};
