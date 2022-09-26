import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { useDocsState } from '../docs.state';
import { ExpandMore } from '@mui/icons-material';
import styles from './DocsMethod.module.scss';
import { DocsMethodDetails } from './DocsMethodDetails';

export function DocsMethod({ method }) {
  const { updateMethod } = useDocsState();

  return (
    <Accordion expanded={!method.collapsed}>
      <AccordionSummary
        expandIcon={<ExpandMore></ExpandMore>}
        onClick={() =>
          updateMethod(method.controllerPath, method.path, {
            collapsed: !method.collapsed,
          })
        }
      >
        <Typography variant="subtitle2">
          {method.path}
          <Typography className={styles.summary} marginLeft={'1rem'} variant="caption">
            {method.summary}
          </Typography>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <DocsMethodDetails method={method}></DocsMethodDetails>
      </AccordionDetails>
    </Accordion>
  );
}
