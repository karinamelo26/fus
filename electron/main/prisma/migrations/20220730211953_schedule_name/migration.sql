/*
  Warnings:

  - You are about to drop the column `description` on the `schedule` table. All the data in the column will be lost.
  - Added the required column `name` to the `schedule` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys= OFF;
CREATE TABLE "new_schedule"
(
    "id"           TEXT     NOT NULL PRIMARY KEY,
    "name"         TEXT     NOT NULL,
    "idDatabase"   TEXT     NOT NULL,
    "query"        TEXT     NOT NULL,
    "weekDay"      INTEGER,
    "month"        INTEGER,
    "monthDay"     INTEGER,
    "frequencyDay" INTEGER,
    "hour"         INTEGER,
    "timeout"      INTEGER  NOT NULL DEFAULT 30000,
    "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    DATETIME NOT NULL,
    "inactiveAt"   DATETIME,
    CONSTRAINT "schedule_idDatabase_fkey" FOREIGN KEY ("idDatabase") REFERENCES "database" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CHECK ( "weekDay" >= 1 AND "weekDay" <= 7 ),
    CHECK ( "month" >= 1 AND "month" <= 12 ),
    CHECK ( "monthDay" >= 1 AND "monthDay" <= 31 ),
    CHECK ( "frequencyDay" >= 1 AND "frequencyDay" <= 12 ),
    CHECK ( "hour" >= 0 AND "hour" <= 23 )
);
INSERT INTO "new_schedule" (
                            "createdAt", "frequencyDay", "hour", "id", "idDatabase", "inactiveAt", "month", "monthDay",
                            "query", "timeout", "updatedAt", "weekDay", "name")
SELECT "createdAt",
       "frequencyDay",
       "hour",
       "id",
       "idDatabase",
       "inactiveAt",
       "month",
       "monthDay",
       "query",
       "timeout",
       "updatedAt",
       "weekDay",
       "description"
FROM "schedule";
DROP TABLE "schedule";
ALTER TABLE "new_schedule"
    RENAME TO "schedule";
PRAGMA foreign_key_check;
PRAGMA foreign_keys= ON;
