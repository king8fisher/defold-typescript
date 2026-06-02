#!/usr/bin/env node
import { dispatch } from "./dispatch";

const code = await dispatch(process.argv.slice(2), {
  stdout: process.stdout,
  stderr: process.stderr,
});
process.exit(code);
