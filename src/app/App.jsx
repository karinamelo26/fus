import { useState } from 'react';
import styles from '@styles/app.module.scss';
import { api } from './api';

export const App = () => {
  const [count, setCount] = useState(0);

  function set() {
    setCount(_count => _count + 1);
    api('scheduler/get-all', { id: 1 }).then(console.log).catch(console.error);
  }

  return (
    <div className={styles.app}>
      <header className={styles.appHeader}>
        <div className={styles.logos}></div>
        <p>Hello Electron + Vite + React!</p>
        <p>
          <button onClick={set}>count is: {count}</button>
        </p>
        <p>
          Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
        <div>
          <a className={styles.appLink} href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
            Learn React
          </a>
          {' | '}
          <a
            className={styles.appLink}
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
          <div className={styles.staticPublic}>
            Place static files into the <code>/public</code> folder
            <img alt="alt" style={{ width: 77 }} src="./node.png" />
          </div>
        </div>
      </header>
    </div>
  );
};
