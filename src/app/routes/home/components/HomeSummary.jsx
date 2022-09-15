import styles from './home-summary.module.scss';
import { Button, Divider, IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { ExpandMore } from '@mui/icons-material';
import { For } from '../../../components/For';

export function HomeSummary({ summary, selectedItem, items, onSelectItem }) {
  const [anchorElDays, setAnchorElDays] = useState(null);
  const openDays = Boolean(anchorElDays);
  const handleClickDays = event => {
    setAnchorElDays(event.currentTarget);
  };
  const handleCloseDays = () => {
    setAnchorElDays(null);
  };
  const [anchorElItems, setAnchorElItems] = useState(null);
  const openItems = Boolean(anchorElItems);
  const handleClickItems = event => {
    setAnchorElItems(event.currentTarget);
  };
  const handleCloseItems = () => {
    setAnchorElItems(null);
  };

  const selectItem = item => {
    onSelectItem(item);
    handleCloseItems();
  };

  return (
    <div className={styles.homeSummary}>
      <div className={styles.container}>
        <div className={styles.options}>
          <IconButton disabled={!items?.length} onClick={handleClickItems}>
            <ExpandMore></ExpandMore>
          </IconButton>
          <Menu open={openItems} anchorEl={anchorElItems} onClose={handleCloseItems}>
            <For each={items} trackBy={'id'}>
              {item => <MenuItem onClick={() => selectItem(item)}>{item.name}</MenuItem>}
            </For>
          </Menu>
          {selectedItem?.name ?? 'Select Item...'}
        </div>
        <div className={styles.boxes}>
          <div className={styles.box}>
            <div className={styles.boxTitle}>% Success</div>
            <div className={styles.boxValue}>{summary?.successRate ?? '?'}%</div>
          </div>
          <div className={styles.boxDivider}>
            <Divider orientation={'vertical'}></Divider>
          </div>

          <div className={styles.box}>
            <div className={styles.boxTitle}>Runs</div>
            <div className={styles.boxValue}>{summary?.runCount ?? '?'}</div>
          </div>
        </div>
      </div>
      <div className={styles.filter}>
        <div>
          <Button onClick={handleClickDays}>Last 7 Days</Button>
          <Menu open={openDays} anchorEl={anchorElDays} onClose={handleCloseDays}>
            <MenuItem onClick={handleCloseDays}>Last 14 Days</MenuItem>
          </Menu>
        </div>
      </div>
    </div>
  );
}
