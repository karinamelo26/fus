import { For } from '../../../components/For';
import { DocsMethod } from './DocsMethod';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useDocsState } from '../docs.state';

export function DocsController({ controller }) {
  const { updateController } = useDocsState();

  return (
    <Accordion expanded={!controller.collapsed}>
      <AccordionSummary
        expandIcon={<ExpandMore></ExpandMore>}
        onClick={() => updateController(controller.name, { collapsed: !controller.collapsed })}
      >
        <Typography>{controller.name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <For each={controller.methods} trackBy="path">
          {(method) => <DocsMethod method={method}></DocsMethod>}
        </For>
      </AccordionDetails>
    </Accordion>
  );
}
