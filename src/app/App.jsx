import styles from '@styles/app.module.scss';
import { api } from './api/api';
import { Button } from '@mui/material';
import { Delete } from '@mui/icons-material';

export const App = () => {
  async function set() {
    /* eslint-disable */
    console.time('api-call');
    await api('schedule/add', {
      name: 'Schedule 1',
      idDatabase: '3f181d49-4513-4902-bc9e-1a5669a0d23d',
      query: 'select * from table',
      frequency: 0,
      monthDay: 1,
      hour: 0,
      timeout: 30000,
      sheet: 'Sheet1',
      active: true,
    })
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
