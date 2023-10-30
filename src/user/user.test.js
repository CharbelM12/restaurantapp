const mongoose = require("mongoose");
const UserService = require("./userService");
const userService = new UserService();
const user = require("./userModel");
const { SHA256 } = require("crypto-js");
const randomString = require("randomstring");
const sendEmail = require("../utils/mailer");
const moment = require("moment");
const errorHandler = require("../errors");
const userConfig = require("./userConfig");
const config = require("../configurations/config");
const generateTokens = require("../utils/jwt");
jest.mock("./userModel");
jest.mock("../utils/mailer");
jest.mock("../utils/jwt");
jest.mock("randomstring", () => ({
  generate: jest.fn(),
}));
jest.mock("crypto-js", () => ({
  SHA256: jest.fn(),
}));
const userId = new mongoose.Types.ObjectId();
const role = userConfig.userRole;
const mockUser = {
  _id: userId,
  email: "test@test.com",
  password: "hashedPassword",
  firstName: "firstName",
  lastName: "lastName",
  isDisabled: false,
  isLocked: false,
  lockedUntil: null,
  role: role,
  failedAttempts: 0,
  phoneNumber: "70036733",
  dateOfBirth: "1990-01-01",
  favoriteItems: ["item1", "item2"],
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  save: jest.fn(),
};
const reqBody = { email: mockUser.email, password: "validPassword" };
describe("User Service", () => {
  describe("User Signup", () => {
    it("Should throw a 409 conflict error when an existing email is entered", async () => {
      user.findOne.mockResolvedValueOnce(mockUser);
      try {
        await userService.signup(
          reqBody.email,
          reqBody.password,
          mockUser.firstName,
          mockUser.lastName
        );
      } catch (error) {
        expect(error.status).toEqual(errorHandler["emailExists"].status);
        expect(error.message).toEqual(errorHandler["emailExists"].message);
      }
    });
    it("Should create a new user when the email is unique", async () => {
      SHA256.mockReturnValueOnce("hashedPassword");
      user.findOne.mockResolvedValueOnce(null);
      user.prototype.save.mockResolvedValueOnce({
        email: mockUser.email,
        password: "hashedPassword",
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });

      const newUser = await userService.signup(
        reqBody.email,
        reqBody.password,
        mockUser.firstName,
        mockUser.lastName
      );

      expect(newUser.email).toEqual(mockUser.email);
      expect(newUser.password).toEqual("hashedPassword");
      expect(newUser.firstName).toEqual(mockUser.firstName);
      expect(newUser.lastName).toEqual(mockUser.lastName);
      expect(user.prototype.save).toHaveBeenCalled();
    });
  });
  describe("User Login", () => {
    it("Should send an invalid credentials error if wrong email was entered", async () => {
      user.findOne.mockResolvedValueOnce(null);
      try {
        await userService.login(reqBody, role);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["invalidCredentials"].status);
        expect(error.message).toEqual(
          errorHandler["invalidCredentials"].message
        );
      }
    });
    it("Should throw disabled error if user is disabled", async () => {
      mockUser.isDisabled = true;
      user.findOne.mockResolvedValueOnce(mockUser);
      try {
        await userService.login(reqBody, role);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["disabled"].status);
        expect(error.message).toEqual(errorHandler["disabled"].message);
      }
    });
    it("should throw an error for a locked account", async () => {
      mockUser.isDisabled = false;
      mockUser.isLocked = true;
      mockUser.lockedUntil = moment("2023-11-05T12:00:00.000Z");
      user.findOne.mockResolvedValue(mockUser);
      try {
        await userService.login(reqBody, role);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["lockedAccount"].status);
        expect(error.message).toEqual(errorHandler["lockedAccount"].message);
      }
    });
    it("Should throw forbidden error if user role does not match", async () => {
      (mockUser.isLocked = false),
        (mockUser.lockedUntil = null),
        (mockUser.role = config.adminRole);
      user.findOne.mockResolvedValueOnce(mockUser);
      try {
        await userService.login(reqBody, role);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["forbidden"].status);
        expect(error.message).toEqual(errorHandler["forbidden"].message);
      }
    });
    it("should lock an account after 10 failed login attempts", async () => {
      reqBody.password = "wrongPassowrd";
      mockUser.failedAttempts = 9;
      mockUser.role = userConfig.userRole;
      user.findOne.mockResolvedValueOnce(mockUser);
      SHA256.mockReturnValue("invalidHashedPassword");
      try {
        await userService.login(reqBody, role);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["lockedAccount"].status);
        expect(error.message).toEqual(errorHandler["lockedAccount"].message);
      }
      expect(mockUser.failedAttempts).toBe(0);
      expect(mockUser.isLocked).toBe(true);
      expect(mockUser.lockedUntil).not.toBeNull();
    });

    it("should return access and refresh tokens for a valid user", async () => {
      mockUser.failedAttempts = 0;
      mockUser.isLocked = false;
      mockUser.lockedUntil = null;
      user.findOne.mockResolvedValueOnce(mockUser);

      SHA256.mockReturnValue("hashedPassword");

      generateTokens.generateAccessTokens.mockResolvedValue("mockAccessToken");
      generateTokens.generateRefreshTokens.mockResolvedValue(
        "mockRefreshToken"
      );

      const result = await userService.login(reqBody, role);

      expect(result).toEqual({
        accessToken: "mockAccessToken",
        refreshToken: "mockRefreshToken",
      });
    });
  });
  describe("Add Admin", () => {
    it("should add a new admin user", async () => {
      user.findOne.mockResolvedValueOnce(null);
      user.findOne.mockResolvedValueOnce(null);
      randomString.generate.mockResolvedValueOnce("randomPassword");
      SHA256.mockReturnValueOnce("hashedPassword");
      user.prototype.save.mockResolvedValueOnce({
        email: mockUser.email,
        password: "hashedPassword",
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: config.adminRole,
      });
      const emailText = `Hello,
    Welcome to the admin panel! We're excited to have you on board.
    To access your account, please use the following password:
    Password: randomPassword
  
    Thank you,
    The Admins Team`;
      sendEmail.mockResolvedValue("Email Sent");
      await userService.addAdmin(
        userId,
        mockUser.email,
        mockUser.firstName,
        mockUser.lastName
      );
      expect(randomString.generate).toHaveBeenCalledWith({
        length: userConfig.passwordLength,
      });
      expect(user.prototype.save).toHaveBeenCalled();
      sendEmail.mockImplementation((mailOptions) => {
        expect(mailOptions.text).toEqual(emailText);
        return "Email Sent";
      });
    });

    it("should update an existing user to admin role", async () => {
      mockUser.role = userConfig.userRole;
      user.findOne.mockResolvedValueOnce(mockUser);
      await userService.addAdmin(
        userId,
        mockUser.email,
        mockUser.firstName,
        mockUser.lastName
      );
      expect(user.findOne).toHaveBeenCalledWith({ _id: userId });
      expect(mockUser.role).toBe(config.adminRole);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should throw an error if the email already exists", async () => {
      user.findOne.mockResolvedValueOnce(null);
      user.findOne.mockResolvedValueOnce({ email: mockUser.email });
      try {
        await userService.addAdmin(
          userId,
          mockUser.email,
          mockUser.firstName,
          mockUser.lastName
        );
      } catch (error) {
        expect(error.status).toEqual(errorHandler["emailExists"].status);
        expect(error.message).toEqual(errorHandler["emailExists"].message);
      }
    });
  });
  describe("enable or disable admin", () => {
    it("should call updateOne with the correct parameters to disable admin", async () => {
      const status = userConfig.disable;
      user.updateOne.mockResolvedValueOnce({ nModified: 1, ok: 1 });
      const result = await userService.disableOrEnableAdmin(userId, status);
      expect(user.updateOne).toHaveBeenCalledWith(
        { _id: userId },
        { $set: { isDisabled: status } }
      );
      expect(result).toEqual({ nModified: 1, ok: 1 });
    });
    it("should call updateOne with the correct parameters to enable admin", async () => {
      const status = userConfig.enable;
      user.updateOne.mockResolvedValueOnce({ nModified: 1, ok: 1 });
      const result = await userService.disableOrEnableAdmin(userId, status);
      expect(user.updateOne).toHaveBeenCalledWith(
        { _id: userId },
        { $set: { isDisabled: status } }
      );
      expect(result).toEqual({ nModified: 1, ok: 1 });
    });
  });
  describe("Get Profile", () => {
    it("should retrieve a user profile based on the user ID", async () => {
      const expectedResult = [
        {
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
          phoneNumber: mockUser.phoneNumber,
          dateOfBirth: mockUser.dateOfBirth,
          favoriteItems: mockUser.favoriteItems,
        },
      ];
      user.aggregate.mockResolvedValueOnce(expectedResult);

      const result = await userService.getProfile(userId);
      expect(user.aggregate).toHaveBeenCalledWith([
        { $match: { _id: userId } },
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
      expect(result).toEqual(expectedResult);
    });
  });
  describe("Update Profile", () => {
    it("should call updateOne with the correct parameters and should return the correct result of updateOne", async () => {
      const reqBody = {
        firstName: "Charbel",
        lastName: "Mounayer",
        dateOfBirth: "12-3-2001",
        phoneNumber: "70036733",
        favoriteItems: ["taouk platter"],
      };
      user.updateOne.mockReturnValueOnce({ nModified: 1, ok: 1 });
      const updateResult = await userService.updateProfile(
        mockUser._id,
        reqBody
      );
      expect(updateResult).toEqual({ nModified: 1, ok: 1 });
    });
  });
  describe("forgotPassword function", () => {
    it("should return an email not found error for a non-existing email", async () => {
      user.findOne.mockResolvedValueOnce(null);
      try {
        await userService.forgotPassword(mockUser.email);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["emailMissing"].status);
        expect(error.message).toEqual(errorHandler["emailMissing"].message);
      }
    });

    it("should generate a reset token and send an email for an existing email", async () => {
      user.findOne.mockResolvedValue(mockUser);
      randomString.generate.mockResolvedValueOnce("mockToken");
      SHA256.mockReturnValueOnce("hashedMockToken");
      const emailText = `Hello,
  
    We received a request to reset the password for your account. To proceed with the password reset, please use the token below:
    
    mockToken
    
    The token is valid for the next hour. After that, you will need to request a new password reset.
    
    Thank you,`;
      sendEmail.mockResolvedValueOnce("Email Sent");

      const result = await userService.forgotPassword(mockUser.email);

      expect(result).toBe("Email Sent");
      expect(mockUser.resetPasswordToken).toBe("hashedMockToken");
      expect(mockUser.resetPasswordTokenExpiry).toBeDefined();
      sendEmail.mockImplementation((mailOptions) => {
        expect(mailOptions.text).toEqual(emailText);
        return "Email Sent";
      });
    });
  });
  describe("resetPassword", () => {
    it("should reset the password for a valid user with a valid token", async () => {
      (mockUser.resetPasswordToken = "validToken"),
        (mockUser.resetPasswordTokenExpiry = moment(
          "2023-10-30T12:00:00.000Z"
        )),
        user.findOne.mockResolvedValueOnce(mockUser);
      SHA256.mockReturnValueOnce("hashedPassword");
      const reqBody = { token: "validToken", password: "newPassword" };
      await userService.resetPassword(reqBody);
      expect(mockUser.password).toEqual("hashedPassword");
      expect(mockUser.resetPasswordToken).toBeNull();
      expect(mockUser.resetPasswordTokenExpiry).toBeNull();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should throw an error for an invalid token", async () => {
      user.findOne.mockResolvedValueOnce(null);

      const reqBody = { token: "invalidToken", password: "newPassword" };

      try {
        await userService.resetPassword(reqBody);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["invalidToken"].status);
        expect(error.message).toEqual(errorHandler["invalidToken"].message);
      }
    });
  });
});
