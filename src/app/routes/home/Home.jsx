import { Divider, Typography } from '@mui/material';
import styles from './home.module.scss';
import { HomeSummaryAll } from './components/HomeSummaryAll';
import { HomeSummaryDatabase } from './components/HomeSummaryDatabase';

export function Home() {
  return (
    <div>
      <div className={styles.title}>
        <Typography variant={'h4'}>Home</Typography>
      </div>

      <Divider></Divider>

      <HomeSummaryAll></HomeSummaryAll>
      <HomeSummaryDatabase></HomeSummaryDatabase>
    </div>
  );
}
