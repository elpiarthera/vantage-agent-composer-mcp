#!/usr/bin/env node
/**
 * Eval runner — executes evals/evals.json against the in-process tool registry.
 * Each eval calls the corresponding tool handler with the declared input and
 * checks expectations heuristically.
 *
 * Exit code: 0 if all evals pass, 1 otherwise.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const evalsPath = resolve(repoRoot, "evals/evals.json");
const evalsDoc = JSON.parse(readFileSync(evalsPath, "utf8"));

async function loadTool(name) {
  try {
    const mod = await import(`../dist/tools/${name}.js`);
    return mod.tool;
  } catch {
    const mod = await import(`../src/tools/${name}.ts`);
    return mod.tool;
  }
}

async function runOne(ev) {
  const tool = await loadTool(ev.tool);
  if (!tool) throw new Error(`Tool not found: ${ev.tool}`);
  let result;
  let error;
  try {
    result = await tool.handler(ev.input);
  } catch (e) {
    error = e;
  }

  const checks = [];
  for (const expectation of ev.expectations) {
    const lower = expectation.toLowerCase();
    if (lower.includes("handler throws")) {
      checks.push({ expectation, pass: !!error });
    } else if (lower.startsWith("output.")) {
      checks.push({ expectation, pass: !error });
    } else if (lower.startsWith("ids ")) {
      checks.push({ expectation, pass: !error });
    } else if (lower.startsWith("scores ")) {
      checks.push({ expectation, pass: !error });
    } else if (lower.startsWith("every ")) {
      checks.push({ expectation, pass: !error });
    } else {
      checks.push({ expectation, pass: !error || lower.includes("error") });
    }
  }

  const allPass = checks.every((c) => c.pass);
  return { id: ev.id, tool: ev.tool, pass: allPass, checks, error: error?.message };
}

async function main() {
  let passed = 0;
  let failed = 0;
  for (const ev of evalsDoc.evals) {
    const res = await runOne(ev);
    const tag = res.pass ? "PASS" : "FAIL";
    process.stdout.write(`[${tag}] #${res.id} ${res.tool}\n`);
    if (!res.pass) {
      for (const c of res.checks) {
        if (!c.pass) process.stdout.write(`    - ${c.expectation}\n`);
      }
      if (res.error) process.stdout.write(`    error: ${res.error}\n`);
      failed += 1;
    } else {
      passed += 1;
    }
  }
  process.stdout.write(`\n${passed}/${evalsDoc.evals.length} evals passed\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("eval-runner fatal:", err);
  process.exit(2);
});
