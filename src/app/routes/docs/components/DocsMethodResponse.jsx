import { Box, Typography } from '@mui/material';
import SyntaxHighlighter from 'react-syntax-highlighter';

export function DocsMethodResponse({ response }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="h6">
        {response.status} - {response.statusMessage}
      </Typography>
      <SyntaxHighlighter language="json">{response.example}</SyntaxHighlighter>
    </Box>
  );
}
