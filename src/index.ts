import express from "express";

import { profileRoute } from "./profile";

const app = express();

const PORT = process.env.PORT || "4000";

// Middleware to parse JSON data
app.use(express.json());

// Define routes
app.use(profileRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
