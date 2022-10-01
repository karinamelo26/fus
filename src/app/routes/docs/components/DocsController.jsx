import { For } from '../../../components/For';
import { DocsMethod } from './DocsMethod';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useDocsState } from '../docs.state';

export function DocsController({ controller }) {
  const { updateController } = useDocsState();

  return (
    <Accordion expanded={!controller.collapsed} TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary
        expandIcon={<ExpandMore></ExpandMore>}
        onClick={() =>
          updateController(controller.path, { collapsed: !controller.collapsed })
        }
      >
        <Typography variant="h6">
          {controller.name}
          <Typography marginLeft={'1rem'} variant="caption">
            {controller.summary}
          </Typography>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <For each={controller.methods} trackBy="path">
          {(method) => <DocsMethod method={method}></DocsMethod>}
        </For>
      </AccordionDetails>
    </Accordion>
  );
}
