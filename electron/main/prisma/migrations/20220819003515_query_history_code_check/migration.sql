PRAGMA foreign_keys = OFF;

create table
  query_history_new (
    id TEXT not null primary key,
    idSchedule TEXT not null constraint query_history_idSchedule_fkey references schedule,
    query TEXT not null,
    code INTEGER not null,
    message TEXT,
    queryTime REAL not null,
    createdAt DATETIME default CURRENT_TIMESTAMP not null,
    updatedAt DATETIME not null,
    inactiveAt DATETIME,
    CHECK ("code" IN (0, 1, 2, 3, 4, 5))
  );

insert into
  query_history_new (
    id,
    idSchedule,
    query,
    code,
    message,
    queryTime,
    createdAt,
    updatedAt,
    inactiveAt
  )
select
  id,
  idSchedule,
  query,
  code,
  message,
  queryTime,
  createdAt,
  updatedAt,
  inactiveAt
from
  query_history;

drop table
  query_history;

ALTER TABLE
  "query_history_new"
RENAME TO
  "query_history";

create index query_history_idSchedule_idx on query_history (idSchedule);

PRAGMA foreign_key_check;

PRAGMA foreign_keys = ON;
