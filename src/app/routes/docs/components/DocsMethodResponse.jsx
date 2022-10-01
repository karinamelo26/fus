import { Card, CardContent, CardHeader, Typography, useTheme } from '@mui/material';
import { percentToHex } from '../../shared/utils/percent-to-hex';
import styles from './DocsMethodResponse.module.scss';
import classnames from 'classnames';

const _5_PERCENT_HEX = percentToHex(5);
const _1_PERCENT_HEX = percentToHex(0.5);

export function DocsMethodResponse({ response, animated = false }) {
  const theme = useTheme();
  const [textColor, backgroundColor] =
    response.status >= 400
      ? [theme.palette.error.dark, theme.palette.error.light]
      : [theme.palette.success.main, theme.palette.success.light];

  return (
    <Card
      className={classnames({ [styles.responseAnimated]: animated })}
      sx={{
        backgroundImage: `linear-gradient(90deg, ${backgroundColor}${_1_PERCENT_HEX} 0%, ${backgroundColor}${_5_PERCENT_HEX} 100%)`,
        border: `1px solid ${textColor}`,
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" color={textColor}>
            {response.status} - {response.statusMessage}
          </Typography>
        }
      ></CardHeader>
      <CardContent>
        <pre>
          <Typography>{response.example ?? 'Empty response'}</Typography>
        </pre>
      </CardContent>
    </Card>
  );
}
