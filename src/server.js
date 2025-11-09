import dotenv from "dotenv";
dotenv.config({ quiet: true });

import connectDB from "./config/db.js";
import app from "./app.js";
import logger from "./config/logger.js";

const PORT = process.env.PORT || 8080;

connectDB();

app.listen(PORT, () => {
  logger.info(`Server running on PORT: ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});
