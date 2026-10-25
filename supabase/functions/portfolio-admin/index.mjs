// Auth and administrator authorization are checked on every request.
import { createHandler } from "../_shared/handler.mjs";
Deno.serve(createHandler(Deno.env.toObject()));
