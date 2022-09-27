import { Divider, Typography } from '@mui/material';
import { For } from '../../../components/For';
import styles from './DocsMethodDetails.module.scss';
import { DocsMethodResponse } from './DocsMethodResponse';
import { DocsMethodRequest } from './DocsMethodRequest';

export function DocsMethodDetails({ method }) {
  return (
    <>
      <DocsMethodRequest method={method}></DocsMethodRequest>
      <div className={styles.responses}>
        <Divider>
          <Typography variant="h6">Responses</Typography>
        </Divider>
        <For each={method.responses} trackBy="status">
          {(response) => <DocsMethodResponse response={response}></DocsMethodResponse>}
        </For>
      </div>
    </>
  );
}
