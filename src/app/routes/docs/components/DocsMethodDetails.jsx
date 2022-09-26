import SyntaxHighlighter from 'react-syntax-highlighter';
import { Divider, Typography } from '@mui/material';
import { For } from '../../../components/For';
import styles from './DocsMethodDetails.module.scss';

export function DocsMethodDetails({ method }) {
  return (
    <>
      <div className={styles.request}>
        <Divider>
          <Typography variant="h6">Request</Typography>
        </Divider>
        <SyntaxHighlighter language="json">{method.request}</SyntaxHighlighter>
      </div>
      <div className={styles.responses}>
        <Divider>
          <Typography variant="h6">Responses</Typography>
        </Divider>
        <For each={method.responses}>
          {(response) => (
            <div className={styles.response}>
              <Typography variant="h6">
                {response.status} - {response.statusMessage}
              </Typography>
              <SyntaxHighlighter language="json">{response.example}</SyntaxHighlighter>
            </div>
          )}
        </For>
      </div>
    </>
  );
}
