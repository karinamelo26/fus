import { Card, CardContent, CardHeader, Typography, useTheme } from '@mui/material';
import { useMemo } from 'react';
import { percentToHex } from '../../shared/utils/percent-to-hex';
import styles from './DocsMethodResponse.module.scss';

const _5_PERCENT_HEX = percentToHex(5);
const _1_PERCENT_HEX = percentToHex(0.5);

export function DocsMethodResponse({ response }) {
  const theme = useTheme();
  const [textColor, backgroundColor] = useMemo(
    () =>
      response.status >= 400
        ? [theme.palette.error.dark, theme.palette.error.light]
        : [theme.palette.success.main, theme.palette.success.light],
    [
      response.status,
      theme.palette.error.dark,
      theme.palette.error.light,
      theme.palette.success.main,
      theme.palette.success.light,
    ]
  );

  return (
    <Card
      className={styles.response}
      sx={{
        backgroundImage: `linear-gradient(90deg, ${backgroundColor}${_1_PERCENT_HEX} 0%, ${backgroundColor}${_5_PERCENT_HEX} 100%)`,
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
