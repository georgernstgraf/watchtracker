/*
  Warnings:

  - You are about to drop the column `tzOffset` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Measurement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" INTEGER NOT NULL,
    "isStart" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "watchId" TEXT NOT NULL,
    CONSTRAINT "Measurement_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "Watch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Measurement" ("comment", "createdAt", "id", "isStart", "value", "watchId") SELECT "comment", "createdAt", "id", "isStart", "value", "watchId" FROM "Measurement";
DROP TABLE "Measurement";
ALTER TABLE "new_Measurement" RENAME TO "Measurement";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "timeZone" TEXT NOT NULL DEFAULT 'UTC'
);
INSERT INTO "new_User" ("id", "name", "timeZone") SELECT "id", "name", "timeZone" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
