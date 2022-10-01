import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Typography,
  useTheme,
} from '@mui/material';
import { useDocsState } from '../docs.state';
import { ExpandMore } from '@mui/icons-material';
import styles from './DocsMethod.module.scss';
import { DocsMethodDetails } from './DocsMethodDetails';
import { percentToHex } from '../../shared/utils/percent-to-hex';

const fromActionToColor = {
  GET: 'info',
  PERSIST: 'success',
  DELETE: 'error',
  ACTION: 'secondary',
};

const _5_PERCENT_HEX = percentToHex(5);
const _1_PERCENT_HEX = percentToHex(0.5);

export function DocsMethod({ method }) {
  const { updateMethod } = useDocsState();

  const theme = useTheme();

  const color = fromActionToColor[method.action];
  const colorHex = theme.palette[color].main;

  return (
    <Accordion
      expanded={!method.collapsed}
      sx={{
        backgroundImage: `linear-gradient(90deg, ${colorHex}${_5_PERCENT_HEX} 0%, ${colorHex}${_1_PERCENT_HEX} 100%)`,
        border: `1px solid ${colorHex}`,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore></ExpandMore>}
        onClick={() =>
          updateMethod(method.controllerPath, method.path, {
            collapsed: !method.collapsed,
          })
        }
      >
        <Chip
          size="small"
          sx={{ mr: 2, width: 80 }}
          color={color}
          label={method.action}
        ></Chip>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
          {method.path}
          <Typography className={styles.summary} marginLeft={'1rem'} variant="caption">
            {method.summary}
          </Typography>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ mb: 2 }}>
          <pre>
            <Typography variant="body1">{method.description}</Typography>
          </pre>
        </Box>
        <DocsMethodDetails method={method}></DocsMethodDetails>
      </AccordionDetails>
    </Accordion>
  );
}
