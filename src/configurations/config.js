require("dotenv").config();

module.exports = {
  port: process.env.port,
  mongoUri: process.env.mongoUri,
  accessTokenSecret: process.env.accessTokenSecret,
  refreshTokenSecret: process.env.refreshTokenSecret,
  accessTokenExpiry: "1h",
  refreshTokenExpiry: "1d",
  userTokenExpiry: 86400,
  service: "gmail",
  user: "mounayercharbel07@gmail.com",
  pass: "ohyrchgpxkhkjufd",
  adminRole: "admin",
  loggerLevel: process.env.loggerLevel,
  loggerStackValue: true,
  pendingStatus: "pending",
  pointLocationType: "Point",
  coordinatesLength: 2,
  longitudeMinValue: -180,
  longitudeMaxValue: 180,
  latitudeMinValue: -90,
  latitudeMaxValue: 90,
  completeAddressAndLabelAndServicesMinLength: 1,
  labelAndBranchNameMaxLength: 50,
  AccessTokenCookieMaxAge: 3.6e6,
  httpOnlyCookieValue: true,
  defaultPageNumber: 1,
  defaultPagelimit: 20,
  minPageAndLimitValue:1
};
