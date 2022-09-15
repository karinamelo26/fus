 -- CreateTable
CREATE TABLE
  "database" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "database" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "inactiveAt" DATETIME CHECK ("type" IN (0, 1))
  );

-- CreateTable
CREATE TABLE
  "schedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "idDatabase" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "weekDay" INTEGER,
    "month" INTEGER,
    "monthDay" INTEGER,
    "frequencyDay" INTEGER,
    "hour" INTEGER,
    "timeout" INTEGER NOT NULL DEFAULT 30000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "inactiveAt" DATETIME,
    CONSTRAINT "schedule_idDatabase_fkey" FOREIGN KEY ("idDatabase") REFERENCES "database" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CHECK (
      "weekDay" >= 1
      AND "weekDay" <= 7
    ),
    CHECK (
      "month" >= 1
      AND "month" <= 12
    ),
    CHECK (
      "monthDay" >= 1
      AND "monthDay" <= 31
    ),
    CHECK (
      "frequencyDay" >= 1
      AND "frequencyDay" <= 12
    ),
    CHECK (
      "hour" >= 0
      AND "hour" <= 23
    )
  );

-- CreateTable
CREATE TABLE
  "query_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "idSchedule" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "message" TEXT,
    "queryTime" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "inactiveAt" DATETIME,
    CONSTRAINT "query_history_idSchedule_fkey" FOREIGN KEY ("idSchedule") REFERENCES "schedule" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
  );
