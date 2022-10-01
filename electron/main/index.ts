import 'reflect-metadata';
import './env';

import { app } from 'electron';

import { Application } from './application';

app
  .whenReady()
  .then(() => Application.create())
  .catch((error) => {
    if (devMode) {
      throw error;
    }
    // TODO CHECK later
    // win?.webContents.send('show-on-console', {
    //   stack: error.stack,
    //   message: error.message,
    //   name: error.name,
    //   fullError: error,
    // });
  });
