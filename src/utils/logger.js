const config = require("../configurations/config");
const { createLogger, transports, format } = require("winston");
const { timestamp, combine, json, errors } = format;
const logger = createLogger({
  level: config.loggerLevel,
  format: combine(timestamp(), json(), errors({ stack: config.loggerStackValue })),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "restaurant.log" }),
  ],
});

module.exports = logger;
