import styles from './home-summary.module.scss';
import { Button, Divider, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { useState } from 'react';
import { ExpandMore } from '@mui/icons-material';
import { For } from '../../../components/For';
import { isNil } from 'st-utils';

export function HomeSummary({
  summary,
  selectedItem,
  items,
  onSelectItem,
  daysPriorSelected,
  onSelectDaysPrior,
}) {
  const [anchorElDays, setAnchorElDays] = useState(null);
  const openDays = Boolean(anchorElDays);
  const handleClickDays = (event) => {
    setAnchorElDays(event.currentTarget);
  };
  const handleCloseDays = () => {
    setAnchorElDays(null);
  };
  const [anchorElItems, setAnchorElItems] = useState(null);
  const openItems = Boolean(anchorElItems);
  const handleClickItems = (event) => {
    setAnchorElItems(event.currentTarget);
  };
  const handleCloseItems = () => {
    setAnchorElItems(null);
  };

  const selectItem = (item) => {
    onSelectItem(item);
    handleCloseItems();
  };
  const selectDaysPrior = (daysPrior) => {
    onSelectDaysPrior(daysPrior);
    handleCloseDays();
  };
  const daysOptions = [
    { daysPrior: 2, label: 'Last 2 days' },
    { daysPrior: 5, label: 'Last 5 days' },
    { daysPrior: 7, label: 'Last 7 days' },
    { daysPrior: 15, label: 'Last 15 days' },
    { daysPrior: 30, label: 'Last 30 days' },
  ];

  return (
    <div className={styles.homeSummary}>
      <div className={styles.container}>
        <div className={styles.options}>
          <IconButton disabled={!items?.length} onClick={handleClickItems}>
            <ExpandMore></ExpandMore>
          </IconButton>
          <Menu open={openItems} anchorEl={anchorElItems} onClose={handleCloseItems}>
            <For each={items} trackBy="id">
              {(item) => (
                <MenuItem onClick={() => selectItem(item)}>{item.name}</MenuItem>
              )}
            </For>
          </Menu>
          {selectedItem?.name ?? 'Select Item...'}
        </div>
        <div className={styles.boxes}>
          <div className={styles.box}>
            <div className={styles.boxTitle}>% Success</div>
            <div className={styles.boxValue}>
              {!isNil(summary?.successRate) ? `${summary.successRate}%` : ''}
            </div>
          </div>
          <div className={styles.boxDivider}>
            <Divider orientation={'vertical'}></Divider>
          </div>

          <div className={styles.box}>
            <div className={styles.boxTitle}>Runs</div>
            <div className={styles.boxValue}>{summary?.runCount}</div>
          </div>

          <div className={styles.boxDivider}>
            <Divider orientation={'vertical'}></Divider>
          </div>

          <div className={styles.box}>
            <Tooltip title={'Active Schedules'} placement={'right'}>
              <div className={styles.boxTitle}>Active Schedules</div>
            </Tooltip>
            <div className={styles.boxValue}>{summary?.scheduleActiveCount}</div>
          </div>
          <div className={styles.boxDivider}>
            <Divider orientation={'vertical'}></Divider>
          </div>

          <div className={styles.box}>
            <Tooltip title={'Average Runtime'} placement={'right'}>
              <div className={styles.boxTitle}>Avg Runtime</div>
            </Tooltip>
            <div className={styles.boxValue}>
              {!isNil(summary?.averageQueryRuntime)
                ? `${summary.averageQueryRuntime}s`
                : ''}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.filter}>
        <div>
          <Button onClick={handleClickDays} disabled={!summary}>
            {daysPriorSelected.label}
          </Button>
          <Menu open={openDays} anchorEl={anchorElDays} onClose={handleCloseDays}>
            <For each={daysOptions} trackBy={'daysPrior'}>
              {(dayOption) => (
                <MenuItem onClick={() => selectDaysPrior(dayOption)}>
                  {dayOption.label}
                </MenuItem>
              )}
            </For>
          </Menu>
        </div>
      </div>
    </div>
  );
}
