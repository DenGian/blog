#!/usr/bin/env node
import process from "node:process";
import { hash } from "bcryptjs";
let password = "";
for await (const chunk of process.stdin) password += chunk;
password = password.replace(/[\r\n]+$/, "");
if (password.length < 14) {
  console.error(
    "Password must contain at least 14 characters. Pipe it via stdin; it is never echoed by this script.",
  );
  process.exit(1);
}
console.log(await hash(password, 12));
