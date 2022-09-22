import { Divider, Typography } from '@mui/material';
import styles from './home.module.scss';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/api';
import { HomeSummary } from './components/HomeSummary';
import { Show } from '../../components/Show';
import { useState } from 'react';

export function Home() {
  const allDatabases = useQuery(['allDatabases'], () => api('database/get-all', { active: true }));
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [selectedDaysPriorAll, setSelectedDaysPriorAll] = useState({ daysPrior: 30, label: 'Last 30 days' });
  const [selectedDaysPriorDatabase, setSelectedDaysPriorDatabase] = useState({ daysPrior: 30, label: 'Last 30 days' });
  const summaryAllQuery = useQuery(['summaryAll', selectedDaysPriorAll], () =>
    api('database/get-all-summary', { daysPrior: selectedDaysPriorAll.daysPrior })
  );

  const databaseSummary = useQuery(['databaseSummary', selectedDatabase, selectedDaysPriorDatabase], () => {
    if (selectedDatabase) {
      return api('database/get-summary', {
        idDatabase: selectedDatabase.id,
        daysPrior: selectedDaysPriorDatabase.daysPrior,
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
        {(data) => (
          <HomeSummary
            summary={data}
            selectedItem={{
              id: 0,
              name: 'All',
            }}
            daysPriorSelected={selectedDaysPriorAll}
            onSelectDaysPrior={(daysPrior) => setSelectedDaysPriorAll(daysPrior)}
          ></HomeSummary>
        )}
      </Show>
      <Show when={allDatabases}>
        {(data) => (
          <HomeSummary
            summary={databaseSummary.data}
            selectedItem={selectedDatabase}
            onSelectItem={(item) => setSelectedDatabase(item)}
            items={data.map((item) => ({
              id: item.idDatabase,
              name: item.name,
            }))}
            daysPriorSelected={selectedDaysPriorDatabase}
            onSelectDaysPrior={(daysPrior) => setSelectedDaysPriorDatabase(daysPrior)}
          ></HomeSummary>
        )}
      </Show>
    </div>
  );
}
