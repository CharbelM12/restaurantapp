const user = require("./userModel");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const errorHandler = require("../errors");
const config = require("../configurations/config");
const userConfig = require("./userConfig");
const moment = require("moment");
const { SHA256 } = require("crypto-js");
const randomString = require("randomstring");
const logger = require("../utils/logger");
const sendEmail = require("../utils/mailer");
const generateTokens = require("../utils/jwt");

class UserService {
  async signup(reqBody) {
    const foundUser = await user.findOne({ email: reqBody.email });
    if (foundUser) {
      throw {
        status: errorHandler["emailExists"].status,
        message: errorHandler["emailExists"].message,
      };
    }
    return await new user({
      email: reqBody.email,
      password: SHA256(reqBody.password).toString(),
      firstName: reqBody.firstName,
      lastName: reqBody.lastName,
    }).save();
  }
  async login(reqBody, role) {
    const newUser = await user.findOne({ email: reqBody.email });
    if (!newUser) {
      throw {
        status: errorHandler["invalidCredentials"].status,
        message: errorHandler["invalidCredentials"].message,
      };
    } else if (newUser.isDisabled) {
      throw {
        status: errorHandler["disabled"].status,
        message: errorHandler["disabled"].message,
      };
    } else if (newUser.isLocked && newUser.lockedUntil > moment()) {
      throw {
        status: errorHandler["lockedAccount"].status,
        message: errorHandler["lockedAccount"].message,
      };
    } else if (newUser.role !== role) {
      throw {
        status: errorHandler["forbidden"].status,
        message: errorHandler["forbidden"].message,
      };
    } else if (newUser.password !== SHA256(reqBody.password).toString()) {
      newUser.failedAttempts += 1;
      if (newUser.failedAttempts >= userConfig.maxPasswordAttempts) {
        newUser.lockedUntil = moment().add(userConfig.lockedCmsForMinutes, "m");
        newUser.isLocked = true;
        newUser.failedAttempts = 0;
        await newUser.save();
        throw {
          status: errorHandler["lockedAccount"].status,
          message: errorHandler["lockedAccount"].message,
        };
      } else {
        await newUser.save();
        throw {
          status: errorHandler["invalidCredentials"].status,
          message: errorHandler["invalidCredentials"].message,
        };
      }
    } else {
      newUser.failedAttempts = 0;
      newUser.isLocked = false;
      await newUser.save();
      const payload = {
        email: newUser.email,
        userId: newUser._id.toString(),
      };
      const accessToken = await generateTokens.generateAccessTokens(payload);
      const refreshToken = await generateTokens.generateRefreshTokens(payload);
      return {
        accessToken,
        refreshToken,
      };
    }
  }

  async addAdmin(userId, email, firstName, lastName) {
    const existingUser = await user.findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (!existingUser) {
      let newPassword = "";
      newPassword = randomString.generate({
        length: userConfig.passwordLength,
      });
      const existingEmail = await user.findOne({ email: email });
      if (existingEmail) {
        throw {
          status: errorHandler["emailExists"].status,
          message: errorHandler["emailExists"].message,
        };
      } else {
        await new user({
          email: email,
          password: SHA256(newPassword).toString(),
          firstName: firstName,
          lastName: lastName,
          role: config.adminRole,
        }).save();
        const mailOptions = {
          from: userConfig.from,
          to: email,
          subject: "new password for admin account",
          text: `Hello,
      Welcome to the admin panel! We're excited to have you on board.
      To access your account, please use the following password:
      Password: ${newPassword}
      
      Thank you,
      The Admins Team`,
        };
        return await sendEmail(mailOptions);
      }
    } else {
      existingUser.role = config.adminRole;
      await existingUser.save();
    }
  }
  async disableOrEnableAdmin(userId, status) {
    return await user.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { isDisabled: status } }
    );
  }
  async getProfile(userId) {
    return await user.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },

      {
        $lookup: {
          from: "items",
          let: { favoriteItemsIds: "$favoriteItems._id" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$favoriteItemsIds"] },
              },
            },
          ],
          as: "favoriteItems",
        },
      },
      {
        $unwind: {
          path: "$item",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          email: 1,
          firstName: 1,
          lastName: 1,
          role: 1,
          phoneNumber: 1,
          dateOfBirth: 1,
          favoriteItems: "$favoriteItems.itemName",
        },
      },
    ]);
  }
  async updateProfile(userId, reqBody) {
    return await user.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        $set: reqBody,
      }
    );
  }
  async forgotPassword(reqBody) {
    const foundUser = await user.findOne({ email: reqBody.email });
    if (!foundUser) {
      throw {
        status: errorHandler["emailMissing"].status,
        message: errorHandler["emailMissing"].message,
      };
    } else {
      const generatedToken = randomString.generate(userConfig.tokenFormat);
      foundUser.resetPasswordToken = SHA256(generatedToken).toString();
      foundUser.resetPasswordTokenExpiry = moment()
        .add(userConfig.resetPasswordTokenExpiry, "s")
        .toString();
      await foundUser.save();
      const mailOptions = {
        from: userConfig.from,
        to: reqBody.email,
        subject: "new password for admin account",
        text: `Hello,
  
          We received a request to reset the password for your account. To proceed with the password reset, please use the token below:
          
          ${generatedToken}
          
          The token is valid for the next hour. After that, you will need to request a new password reset.
          
          Thank you,`,
      };
      return await sendEmail(mailOptions);
    }
  }
  async resetPassword(reqBody) {
    const foundUser = await user.findOne({
      resetPasswordToken: SHA256(reqBody.token),
      resetPasswordTokenExpiry: { $gt: moment() },
    });
    if (!foundUser) {
      throw {
        status: errorHandler["invalidToken"].status,
        message: errorHandler["invalidToken"].message,
      };
    } else {
      foundUser.password = SHA256(reqBody.password).toString();
      foundUser.resetPasswordToken = null;
      foundUser.resetPasswordTokenExpiry = null;
      await foundUser.save();
    }
  }
}

module.exports = UserService;
