const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 5000;

// Serve static files from the build folder
app.use(express.static(path.join(__dirname, "Front-end/build")));

// SPA fallback - redirect all requests to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "Front-end/build/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
