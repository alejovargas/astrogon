const fs = require("fs");
const path = require("path");

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const hasBadChars = content.includes("\ufffd");

    if (hasBadChars) {
      console.error(`⚠️ File contains invalid characters: ${filePath}`);

      // Try to locate the position
      const lines = content.split("\n");
      lines.forEach((line, i) => {
        if (line.includes("\ufffd")) {
          console.error(`  - Line ${i + 1}: ${line.substring(0, 20)}...`);
        }
      });
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
}

// Find all JS files in dist/ recursively
function findJsFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findJsFiles(filePath);
    } else if (file.endsWith(".js")) {
      checkFile(filePath);
    }
  });
}

console.log("Checking for invalid characters in JS files...");
findJsFiles("./dist");
