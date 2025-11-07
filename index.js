import connectDB from "./db/connectDB.js";
import express from "express";
import cors from "cors";
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Start server only after DB connection succeeds. If DB connection fails,
// exit with a non-zero code so the process manager (or developer) knows.
try {
  // top-level await allowed because package.json sets "type": "module"
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
} catch (err) {
  console.error("Failed to start server due to DB connection error. Exiting.");
  process.exit(1);
}
