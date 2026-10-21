import { handlers } from "@/lib/auth";

/** Auth.js route handler: OAuth callbacks, session lookup, CSRF, sign-in/out. */
export const { GET, POST } = handlers;
