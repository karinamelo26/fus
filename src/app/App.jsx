import { Sidenav } from './components/Sidenav/Sidenav';
import styles from './app.module.scss';
import { Route, Routes } from 'react-router-dom';
import { Databases } from './routes/databases/Databases';
import { Schedules } from './routes/schedules/Schedules';
import { Home } from './routes/home/Home';

export function App() {
  return (
    <div className={styles.App}>
      <aside>
        <Sidenav></Sidenav>
      </aside>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Home></Home>}></Route>
          <Route path="/databases" element={<Databases></Databases>}></Route>
          <Route path="/schedules" element={<Schedules></Schedules>}></Route>
        </Routes>
      </main>
    </div>
  );
}
