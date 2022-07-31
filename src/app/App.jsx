import styles from '@styles/app.module.scss';
import { api } from './api';
import { Button } from '@mui/material';
import { Delete } from '@mui/icons-material';

export const App = () => {
  async function set() {
    /* eslint-disable */
    console.time('api-call');
    await api('database/get-all-summary', { idDatabase: '9cf8be50-9992-4c29-9300-a9bb8bbee2af', daysPrior: 7 })
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
