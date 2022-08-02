/*
  Warnings:

  - You are about to drop the column `frequencyDay` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `schedule` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "idDatabase" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "weekDay" INTEGER,
    "monthDay" INTEGER,
    "hour" INTEGER,
    "timeout" INTEGER NOT NULL DEFAULT 30000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "inactiveAt" DATETIME,
    CONSTRAINT "schedule_idDatabase_fkey" FOREIGN KEY ("idDatabase") REFERENCES "database" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CHECK ( "weekDay" >= 1 AND "weekDay" <= 7 ),
    CHECK ( "monthDay" >= 1 AND "monthDay" <= 31 ),
    CHECK ( "hour" >= 0 AND "hour" <= 23 )
);
INSERT INTO "new_schedule" ("createdAt", "hour", "id", "idDatabase", "inactiveAt", "monthDay", "name", "query", "timeout", "updatedAt", "weekDay") SELECT "createdAt", "hour", "id", "idDatabase", "inactiveAt", "monthDay", "name", "query", "timeout", "updatedAt", "weekDay" FROM "schedule";
DROP TABLE "schedule";
ALTER TABLE "new_schedule" RENAME TO "schedule";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
