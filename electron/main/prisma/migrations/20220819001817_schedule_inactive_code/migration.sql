PRAGMA foreign_keys = OFF;

create table
  schedule_new (
    id TEXT not null primary key,
    name TEXT not null,
    idDatabase TEXT not null constraint schedule_idDatabase_fkey references database,
    query TEXT not null,
    weekDay INTEGER,
    monthDay INTEGER,
    hour INTEGER not null,
    frequency INTEGER not null,
    timeout INTEGER default 30000 not null,
    sheet TEXT not null,
    filePath TEXT not null,
    createdAt DATETIME default CURRENT_TIMESTAMP not null,
    updatedAt DATETIME not null,
    inactiveAt DATETIME,
    rawCronTime TEXT,
    temporaryFilename TEXT,
    inactiveCode INTEGER,
    check ("frequency" IN (0, 1, 2)),
    check (
      "hour" >= 0
      AND "hour" <= 23
    ),
    check (
      "monthDay" >= 1
      AND "monthDay" <= 31
    ),
    check (
      "weekDay" >= 1
      AND "weekDay" <= 7
    ),
    check ("inactiveCode" in (0, 1, 2)),
    check (
      (
        "frequency" = 0
        AND "monthDay" IS NOT NULL
      )
      OR (
        "frequency" = 1
        AND "weekDay" IS NOT NULL
      )
      OR ("frequency" = 2)
      OR ("rawCronTime" IS NOT NULL)
    )
  );

insert into
  schedule_new (
    "createdAt",
    "frequency",
    "hour",
    "id",
    "idDatabase",
    "inactiveAt",
    "monthDay",
    "name",
    "query",
    "timeout",
    "updatedAt",
    "weekDay",
    "sheet",
    "filePath"
  )
select
  "createdAt",
  "frequency",
  "hour",
  "id",
  "idDatabase",
  "inactiveAt",
  "monthDay",
  "name",
  "query",
  "timeout",
  "updatedAt",
  "weekDay",
  "sheet",
  "filePath"
from
  schedule;

drop table
  schedule;

ALTER TABLE
  "schedule_new"
RENAME TO
  "schedule";

create index schedule_idDatabase_idx on schedule (idDatabase);

PRAGMA foreign_key_check;

PRAGMA foreign_keys = ON;
