import { Alert, Box, Button, Divider, Stack, TextField, Typography } from '@mui/material';
import { useDocsState } from '../docs.state';
import { Show } from '../../../components/Show';
import { isArray, isDate, isObject } from 'st-utils';
import { useApi } from '../../../api/api';
import { DocsMethodResponse } from './DocsMethodResponse';

export function DocsMethodRequest({ method }) {
  const api = useApi({ fullResponse: true, ignoreInterceptors: true });
  const { updateMethod } = useDocsState();

  function update(partial) {
    updateMethod(method.controllerPath, method.path, partial);
  }

  function onClickTryItOut() {
    update({ isEditingRequest: true });
  }

  function onReset() {
    update({
      isEditingRequest: false,
      requestEditable: method.request,
      result: null,
      error: null,
    });
  }

  function onCodeChange(code) {
    update({ requestEditable: code });
  }

  function removeOptionalFromKeys(value) {
    if (isArray(value)) {
      return value.map((item) => removeOptionalFromKeys(item));
    } else if (isDate(value)) {
      return value;
    } else if (isObject(value)) {
      return Object.entries(value).reduce(
        (acc, [key, _value]) => ({
          ...acc,
          [key.replace(/\?$/, '')]: removeOptionalFromKeys(_value),
        }),
        {}
      );
    }
    return value;
  }

  function validateRequest() {
    const { requestEditable } = method;
    try {
      const json = JSON.parse(requestEditable);
      update({ invalidPayload: false });
      return removeOptionalFromKeys(json);
    } catch {
      update({ invalidPayload: true });
      return null;
    }
  }

  async function onExecute() {
    const json = validateRequest();
    if (!json) {
      return;
    }
    update({ isRequesting: true });
    try {
      const result = await api(method.path, json);
      update({ result, error: null });
    } catch (error) {
      update({ error, result: null });
    } finally {
      update({ isRequesting: false });
    }
  }

  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ mb: 1 }}>
        <Divider>
          <Typography variant="h6">Request</Typography>
        </Divider>
      </Box>
      <TextField
        label="Request Data"
        multiline
        value={method.requestEditable}
        onChange={(event) => onCodeChange(event.target.value)}
        disabled={!method.isEditingRequest || method.isRequesting}
        fullWidth
      ></TextField>
      <Show when={method.invalidPayload}>
        <Box sx={{ mt: 1 }}>
          <Alert severity="error">JSON is invalid</Alert>
        </Box>
      </Show>
      <Show when={method.result}>
        {(result) => (
          <DocsMethodResponse
            response={{
              status: result.statusCode,
              statusMessage: result.status,
              example: JSON.stringify(result.data, null, 4),
            }}
          ></DocsMethodResponse>
        )}
      </Show>
      <Show when={method.error}>
        {(error) => (
          <DocsMethodResponse
            response={{
              status: error.statusCode,
              statusMessage: error.status,
              example: JSON.stringify(error, null, 4),
            }}
          ></DocsMethodResponse>
        )}
      </Show>
      <Box sx={{ mt: 1 }}>
        <Show when={!method.isEditingRequest}>
          <Button variant="contained" onClick={onClickTryItOut}>
            Try it out
          </Button>
        </Show>
        <Show when={method.isEditingRequest}>
          <Stack spacing={1} direction="row">
            <Button
              onClick={onExecute}
              variant="contained"
              disabled={method.isRequesting}
            >
              Execute
            </Button>
            <Button onClick={onReset} disabled={method.isRequesting}>
              Reset
            </Button>
          </Stack>
        </Show>
      </Box>
    </Box>
  );
}
