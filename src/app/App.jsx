import { useState } from 'react';
import styles from '@styles/app.module.scss';
import { api } from './api';
import { Button } from '@mui/material';
import { Delete } from '@mui/icons-material';

export const App = () => {
  const [count, setCount] = useState(0);

  async function set() {
    setCount(_count => _count + 1);
    console.time('api-call');
    await api('scheduler/get-all', { id: 1 }).then(console.log).catch(console.error);
    console.timeEnd('api-call');
  }

  return (
    <div className={styles.app}>
      <Button variant={'contained'}>Teste</Button>
      <Delete></Delete>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium amet aspernatur eligendi esse ipsam
      molestias necessitatibus provident quis sint sit. Alias culpa inventore laborum odio perferendis totam velit
      voluptas voluptates.
    </div>
  );
};
