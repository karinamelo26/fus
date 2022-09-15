/*
Warnings:

- Added the required column `mode` to the `query_history` table without a default value. This is not possible if the table is not empty.

 */
-- RedefineTables
PRAGMA foreign_keys = OFF;

CREATE TABLE
  "new_query_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idSchedule" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "message" TEXT,
    "queryTime" REAL NOT NULL,
    "mode" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "inactiveAt" DATETIME,
    CONSTRAINT "query_history_idSchedule_fkey" FOREIGN KEY ("idSchedule") REFERENCES "schedule" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CHECK ("code" IN (0, 1, 2, 3, 4, 5)),
    CHECK ("mode" IN (0, 1))
  );

INSERT INTO
  "new_query_history" (
    "code",
    "createdAt",
    "id",
    "idSchedule",
    "inactiveAt",
    "message",
    "query",
    "queryTime",
    "updatedAt",
    "mode"
  )
SELECT
  "code",
  "createdAt",
  "id",
  "idSchedule",
  "inactiveAt",
  "message",
  "query",
  "queryTime",
  "updatedAt",
  0
FROM
  "query_history";

DROP TABLE
  "query_history";

ALTER TABLE
  "new_query_history"
RENAME TO
  "query_history";

CREATE INDEX "query_history_idSchedule_idx" ON "query_history" ("idSchedule");

PRAGMA foreign_key_check;

PRAGMA foreign_keys = ON;
