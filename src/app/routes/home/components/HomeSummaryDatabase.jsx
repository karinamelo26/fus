import { HomeSummary } from './HomeSummary';
import { Show } from '../../../components/Show';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api/api';
import { useState } from 'react';

export function HomeSummaryDatabase() {
  const allDatabases = useQuery(['allDatabases'], () =>
    api('database/get-all', { active: true })
  );
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [selectedDaysPriorDatabase, setSelectedDaysPriorDatabase] = useState({
    daysPrior: 30,
    label: 'Last 30 days',
  });
  const databaseSummary = useQuery(
    ['databaseSummary', selectedDatabase, selectedDaysPriorDatabase],
    () => {
      if (selectedDatabase) {
        return api('database/get-summary', {
          idDatabase: selectedDatabase.id,
          daysPrior: selectedDaysPriorDatabase.daysPrior,
        });
      }
      return Promise.resolve(null);
    },
    { keepPreviousData: true }
  );
  return (
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
  );
}
