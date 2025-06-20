// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Support __dirname with ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve the built static files from "dist"
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 4173;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
