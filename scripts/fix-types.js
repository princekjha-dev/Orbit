const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const srcDir = path.join(root, "src");


function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;

  // Zod v4 fix: errors → issues
  if (content.includes("parsed.error.errors[0]")) {
    content = content.replace(
      /parsed\.error\.errors\[0\]\.message/g,
      'parsed.error.issues[0]?.message ?? "Validation error"'
    );
    changed = true;
  }

  // Lucide Github → GitBranch
  if (content.includes(", Github,") || content.includes("{Github,") || content.includes(", Github }") || content.includes("{ Github }")) {
    content = content.replace(/\bGithub\b/g, "GitBranch");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log("Fixed:", filePath.replace(__dirname + "/", ""));
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules") {
      walk(full);
    } else if (e.isFile() && (e.name.endsWith(".ts") || e.name.endsWith(".tsx"))) {
      fixFile(full);
    }
  }
}

walk(srcDir);
// Also fix seed
fixFile(path.join(root, "prisma/seed.ts"));
console.log("Done.");

