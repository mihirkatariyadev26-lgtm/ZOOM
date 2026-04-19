const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

const PORT = process.env.PORT || 5000;

// Try different possible paths
const possiblePaths = [
  path.join(__dirname, "Front-end/build"),
  path.join(__dirname, "front-end/build"),
  path.join(__dirname, "frontend/build"),
  path.join(process.cwd(), "Front-end/build"),
];

let buildPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    buildPath = p;
    console.log("✓ Found build folder at:", buildPath);
    break;
  }
}

if (!buildPath) {
  console.error("✗ Build folder not found!");
  console.error("Checked:", possiblePaths);
  process.exit(1);
}

// Serve static files
app.use(express.static(buildPath));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
