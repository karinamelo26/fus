import { config } from 'dotenv';
import { app } from 'electron';

if (!app.isPackaged) {
  config();
}
