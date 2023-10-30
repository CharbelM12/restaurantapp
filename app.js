const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const config = require("./src/configurations/config");
const errorHandler = require("./src/middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const globalRoutes = require("./src/globalRoutes");
const errorsHandler = require("./src/errors");
const logger = require("./src/utils/logger");
const multer = require("multer");
const path = require("path");
const moment = require("moment");
const multerMiddleware = require("./src/middlewares/multer");

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  multer({
    storage: multerMiddleware.fileStorage,
    fileFilter: multerMiddleware.fileFilter,
  }).single("imageUrl")
);
app.use("/images", express.static(path.join(__dirname, "images")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(globalRoutes);
async function connect() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.debug("Mongodb connected");
  } catch (error) {
    throw {
      status: errorsHandler["notConnected"].status,
      message: errorsHandler["notConnected"].message,
    };
  }
}
app.use(errorHandler);

app.listen(config.port, () => {
  connect();
  logger.debug("listening from port " + config.port);
});
