import { Sidenav } from './components/Sidenav/Sidenav';
import styles from './app.module.scss';

export function App() {
  return (
    <div className={styles.App}>
      <aside>
        <Sidenav></Sidenav>
      </aside>
      <main></main>
    </div>
  );
}
