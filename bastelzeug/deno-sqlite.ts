import { Database } from "@db/sqlite";
const db = new Database(":memory:");
const [version] = db.prepare("select sqlite_version()").value<[string]>()!;
console.log(version);
db.close();
