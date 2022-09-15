 -- AlterTable
ALTER TABLE
  "schedule"
ADD COLUMN
  "rawCronTime" TEXT;

ALTER TABLE
  "schedule"
ADD COLUMN
  "temporaryFilename" TEXT;
