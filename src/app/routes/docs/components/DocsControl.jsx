import { debounce, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';
import { ArrowDownward, ArrowUpward, Search } from '@mui/icons-material';
import styles from './DocsControl.module.scss';
import { DocsSelectors, useDocsState } from '../docs.state';
import { useRecoilValue } from 'recoil';

export function DocsControl() {
  const { setTerm, setOrderByDirection } = useDocsState();
  const orderByDirection = useRecoilValue(DocsSelectors.getOrderByDirection);

  const onChange = debounce((value) => {
    setTerm(value);
  });

  function getOrderIcon() {
    return orderByDirection === 'asc' ? <ArrowDownward></ArrowDownward> : <ArrowUpward></ArrowUpward>;
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
        <Tooltip title={orderByDirection === 'asc' ? 'Ordem decrescente' : 'Ordem crescente'}>
          <IconButton onClick={() => setOrderByDirection(orderByDirection === 'asc' ? 'desc' : 'asc')}>
            {getOrderIcon()}
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}