import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { useDocsState } from '../docs.state';
import { ExpandMore } from '@mui/icons-material';
import styles from './DocsMethod.module.scss';

export function DocsMethod({ method }) {
  const { updateMethod } = useDocsState();

  return (
    <Accordion expanded={!method.collapsed}>
      <AccordionSummary
        expandIcon={<ExpandMore></ExpandMore>}
        onClick={() => updateMethod(method.controllerPath, method.path, { collapsed: !method.collapsed })}
      >
        <Typography variant="subtitle2">
          {method.path}
          <Typography className={styles.summary} marginLeft={'1rem'} variant="caption">
            {method.summary}
          </Typography>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <div>Request body</div>
        <div>Execute button (enabled when all fields required were filled)</div>
        <div>Possible Responses</div>
        <div>actual Response</div>
      </AccordionDetails>
    </Accordion>
  );
}
