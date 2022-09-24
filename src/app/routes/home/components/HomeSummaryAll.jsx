import { HomeSummary } from './HomeSummary';
import { Show } from '../../../components/Show';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../api/api';
import { useState } from 'react';

export function HomeSummaryAll() {
  const [selectedDaysPriorAll, setSelectedDaysPriorAll] = useState({
    daysPrior: 30,
    label: 'Last 30 days',
  });

  const summaryAllQuery = useQuery(
    ['summaryAll', selectedDaysPriorAll],
    () => api('database/get-all-summary', { daysPrior: selectedDaysPriorAll.daysPrior }),
    { keepPreviousData: true }
  );

  return (
    <Show when={summaryAllQuery}>
      {(summary) => (
        <HomeSummary
          summary={summary}
          selectedItem={{
            id: 0,
            name: 'All',
          }}
          daysPriorSelected={selectedDaysPriorAll}
          onSelectDaysPrior={(daysPrior) => setSelectedDaysPriorAll(daysPrior)}
        ></HomeSummary>
      )}
    </Show>
  );
}