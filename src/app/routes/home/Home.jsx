import { Divider, Typography } from '@mui/material';
import styles from './home.module.scss';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/api';
import { HomeSummary } from './components/HomeSummary';
import { Show } from '../../components/Show';
import { useState } from 'react';

export function Home() {
  const summaryAllQuery = useQuery(['summaryAll'], () => api('database/get-all-summary', { daysPrior: 7 }));
  const allDatabases = useQuery(['allDatabases'], () => api('database/get-all', { active: true }));
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const databaseSummary = useQuery(['databaseSummary', selectedDatabase], () => {
    if (selectedDatabase) {
      return api('database/get-summary', {
        idDatabase: selectedDatabase.id,
        daysPrior: 7,
      });
    }
    return Promise.resolve(null);
  });
  return (
    <div>
      <div className={styles.title}>
        <Typography variant={'h4'}>Home</Typography>
      </div>

      <Divider></Divider>
      <Show when={summaryAllQuery}>
        {({ data }) => (
          <HomeSummary
            summary={data}
            selectedItem={{
              id: 0,
              name: 'All',
            }}
          ></HomeSummary>
        )}
      </Show>
      <Show when={allDatabases}>
        {({ data }) => (
          <HomeSummary
            summary={databaseSummary.data?.data}
            selectedItem={selectedDatabase}
            onSelectItem={item => setSelectedDatabase(item)}
            items={data.map(item => ({
              id: item.idDatabase,
              name: item.name,
            }))}
          ></HomeSummary>
        )}
      </Show>
    </div>
  );
}
