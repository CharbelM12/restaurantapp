const config = require("../configurations/config");
const nodemailer = require("nodemailer");
const errorHandler=require("../errors");
const logger=require("../utils/logger")
const transporter = nodemailer.createTransport({
  service: config.service,
  auth: {
    user: config.user,
    pass: config.pass,
  },
});
async function sendEmail(mailOptions) {
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      throw {
        status: errorHandler["failedEmail"].status,
        message: errorHandler["failedEmail"].message,
      };
    } else {
      logger.debug("Email sent: " + info.response);
    }
  });
}
module.exports = sendEmail;
