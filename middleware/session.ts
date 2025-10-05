import expressSession from "express-session";
import sessionOptions from "../lib/sessionOptions.ts";
const session = expressSession(sessionOptions);
export default session;
