import styles from '@styles/app.module.scss';
import { api } from './api/api';
import { Button } from '@mui/material';
import { Delete } from '@mui/icons-material';

export const App = () => {
  async function set() {
    /* eslint-disable */
    console.time('api-call');
    await api('schedule/execute', { idSchedule: '2286f36e-254b-411a-abb4-c0eebdc210b0' })
      .then(console.log)
      .catch(console.error);
    console.timeEnd('api-call');
    /* eslint-enable */
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
