import { debounce, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import { ArrowDownward, ArrowUpward, Search } from '@mui/icons-material';
import styles from './DocsControl.module.scss';
import { DocsStateSelectors, useDocsState } from '../docs.state';
import { useRecoilValue } from 'recoil';
import { useMemo } from 'react';

export function DocsControl() {
  const { setTerm, setOrderByDirection } = useDocsState();
  const orderByDirection = useRecoilValue(DocsStateSelectors.getOrderByDirection);

  const onChange = useMemo(
    () =>
      debounce((value) => {
        setTerm(value);
      }, 200),
    []
  );

  function getOrderIcon() {
    return orderByDirection === 'asc' ? (
      <ArrowDownward></ArrowDownward>
    ) : (
      <ArrowUpward></ArrowUpward>
    );
  }

  return (
    <div className={styles.docsControl}>
      <TextField
        onInput={(event) => onChange(event.target.value)}
        fullWidth
        label="Search..."
        InputProps={{
          endAdornment: (
            <InputAdornment position="start">
              <Search></Search>
            </InputAdornment>
          ),
        }}
      ></TextField>
      <div className={styles.orderButton}>
        <Tooltip title={orderByDirection === 'asc' ? 'Ascending' : 'Descending'}>
          <IconButton
            onClick={() =>
              setOrderByDirection(orderByDirection === 'asc' ? 'desc' : 'asc')
            }
          >
            {getOrderIcon()}
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
