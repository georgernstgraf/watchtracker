-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tzOffset" INTEGER NOT NULL DEFAULT 120,
    "timeZone" TEXT NOT NULL DEFAULT 'UTC'
);

-- CreateTable
CREATE TABLE "Watch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastUserId" TEXT,
    "comment" TEXT,
    CONSTRAINT "Watch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Watch_lastUserId_fkey" FOREIGN KEY ("lastUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Measurement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" INTEGER NOT NULL,
    "isStart" BOOLEAN NOT NULL,
    "comment" TEXT,
    "watchId" TEXT NOT NULL,
    CONSTRAINT "Measurement_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "Watch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Watch_lastUserId_key" ON "Watch"("lastUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Watch_name_userId_key" ON "Watch"("name", "userId");
