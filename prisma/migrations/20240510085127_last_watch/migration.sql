-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tzOffset" INTEGER NOT NULL DEFAULT 120
);
INSERT INTO "new_User" ("id", "name", "tzOffset") SELECT "id", "name", "tzOffset" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
CREATE TABLE "new_Watch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastUserId" TEXT,
    "comment" TEXT,
    CONSTRAINT "Watch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Watch_lastUserId_fkey" FOREIGN KEY ("lastUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Watch" ("comment", "id", "name", "userId") SELECT "comment", "id", "name", "userId" FROM "Watch";
DROP TABLE "Watch";
ALTER TABLE "new_Watch" RENAME TO "Watch";
CREATE UNIQUE INDEX "Watch_lastUserId_key" ON "Watch"("lastUserId");
CREATE UNIQUE INDEX "Watch_name_userId_key" ON "Watch"("name", "userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
