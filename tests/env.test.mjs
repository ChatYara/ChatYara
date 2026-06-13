import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test(".env.example contem somente chaves vazias obrigatorias", () => {
  const content = fs.readFileSync(new URL("../.env.example", import.meta.url), "utf8");

  assert.match(content, /^AI_PROVIDER=gemini$/m);

  for (const key of ["GEMINI" + "_API_KEY", "OPENAI" + "_API_KEY", "DATABASE" + "_URL", "JWT" + "_SECRET"]) {
    assert.match(content, new RegExp(`^${key}=$`, "m"));
  }

  for (const marker of ["sk" + "-proj-", "sk" + "-", "github" + "_pat_", "gh" + "p_"]) {
    assert.equal(content.includes(marker), false);
  }
});
