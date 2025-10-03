// db.js
import { PrismaClient } from "../prisma/client/client.ts";
export default new PrismaClient(/* { log: ['query'] } */);
