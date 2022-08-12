import { Notification, NotificationConstructorOptions } from 'electron';
import { concat, concatMap, ignoreElements, of, Subject, timer } from 'rxjs';

import { Injectable } from '../../di/injectable';

import { NotificationPriorityEnum } from './notification-priority.enum';

const _15_SECONDS_IN_MS = 15_000;

@Injectable({ global: true })
export class NotificationService {
  constructor() {
    this._init();
  }

  private readonly _queue$ = new Subject<NotificationConstructorOptions>();

  private _init(): void {
    this._queue$
      .pipe(
        concatMap(notificationOptions =>
          concat(of(notificationOptions), timer(_15_SECONDS_IN_MS).pipe(ignoreElements()))
        )
      )
      .subscribe(config => {
        this._show(config);
      });
  }

  private _show(config: NotificationConstructorOptions): Notification {
    const notification = new Notification(config);
    notification.show();
    return notification;
  }

  show(config: NotificationConstructorOptions): void;
  show(config: NotificationConstructorOptions, priority: NotificationPriorityEnum.Queue): void;
  show(config: NotificationConstructorOptions, priority: NotificationPriorityEnum.Now): Notification;
  show(config: NotificationConstructorOptions, priority = NotificationPriorityEnum.Queue): Notification | void {
    if (priority === NotificationPriorityEnum.Now) {
      return this._show(config);
    }
    this._queue$.next(config);
  }
}
