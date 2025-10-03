// db.js
import { PrismaClient } from "../prisma/client/client.ts";
export const prisma = new PrismaClient(/* { log: ['query'] } */);
