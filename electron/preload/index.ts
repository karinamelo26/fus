import { contextBridge, ipcRenderer } from 'electron';

import { InternalServerErrorException } from '../main/api/exception';
import { Response } from '../main/api/response';

import { formatResponse } from './format-response';

function domReady(
  condition: DocumentReadyState[] = ['complete', 'interactive']
): Promise<boolean> {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
  },
};

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading(): { appendLoading: () => void; removeLoading: () => void } {
  const className = `loaders-css__square-spin`;
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `;
  const oStyle = document.createElement('style');
  const oDiv = document.createElement('div');

  oStyle.id = 'app-loading-style';
  oStyle.innerHTML = styleContent;
  oDiv.className = 'app-loading-wrap';
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`;

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    },
  };
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev) => {
  if (ev.data.payload === 'removeLoading') {
    removeLoading();
  }
};

let apiReadyPromiseResolve: () => void;
const apiReadyPromise = new Promise<void>((resolve) => {
  apiReadyPromiseResolve = resolve;
});

// TODO improve this file
// Sometimes we get an error on front-end

contextBridge.exposeInMainWorld('api-ready', () => apiReadyPromise);

ipcRenderer.on('init-api', (_, paths: string[]) => {
  const api = paths.reduce(
    (acc, path) => ({
      ...acc,
      [path]: async (...args: unknown[]) => {
        let result: Response;
        try {
          result = await ipcRenderer.invoke(path, ...args);
        } catch (error) {
          result = new InternalServerErrorException(
            error?.message ?? error?.error ?? 'Unknown error'
          );
        }
        return formatResponse(result);
      },
    }),
    {}
  );
  contextBridge.exposeInMainWorld('api-internal', api);
  apiReadyPromiseResolve();
});

ipcRenderer.on('show-on-console', (_, args) => {
  // TODO improve this logging
  // eslint-disable-next-line no-console -- Debugging
  console.log(args);
});
