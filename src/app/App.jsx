import styles from '@styles/app.module.scss';
import { api } from './api/api';
import { Button } from '@mui/material';
import { Delete } from '@mui/icons-material';

export const App = () => {
  async function set() {
    /* eslint-disable */
    console.time('api-call');
    await api('database/add', {
      name: 'Database 1',
      host: 'localhost',
      port: 3009,
      username: 'root',
      password: '12345',
      database: 'main',
      type: 0,
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
