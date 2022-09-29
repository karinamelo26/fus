import { Card, CardContent, CardHeader, Typography, useTheme } from '@mui/material';

export function DocsMethodResponse({ response }) {
  const theme = useTheme();

  return (
    <Card sx={{ mb: 2, mt: 2 }}>
      <CardHeader
        title={
          <Typography variant="h6">
            {response.status} - {response.statusMessage}
          </Typography>
        }
      ></CardHeader>
      <CardContent style={{ backgroundColor: theme.palette.grey.A200 }}>
        <pre>
          <Typography>{response.example}</Typography>
        </pre>
      </CardContent>
    </Card>
  );
}
