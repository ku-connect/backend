import express from "express";

import { profileRoute } from "./profile";
import { interactionsRoute } from "./interactions";

const app = express();

const PORT = process.env.PORT || "4000";

// Middleware to parse JSON data
app.use(express.json());

// Global Error Handling
// @ts-ignore
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Server Error",
    error: err.message,
  });
});

// Define routes
app.use("/api/profiles", profileRoute);
app.use("/api/interactions", interactionsRoute);

app.get("/healthz", (_, res) => res.sendStatus(200));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
