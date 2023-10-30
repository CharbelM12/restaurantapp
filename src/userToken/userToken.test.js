const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const userToken = require("./userTokenModel");
const UserTokenService = require("./userTokenService");
const userTokenService = new UserTokenService();
const errorHandler = require("../errors");
const generateTokens = require("../utils/jwt");

jest.mock("./userTokenModel");
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));
jest.mock("../utils/jwt");
const mockUserToken = {
  refreshToken: "refreshToken",
  userId: new mongoose.Types.ObjectId(),
  expiryDate: "2023-10-26T12:00:00.000Z",
};
const mockCookies = { refreshToken: "RefreshToken" };
describe("userTokenService", () => {
  describe("refreshToken function", () => {
    it("should throw an error if refreshToken is not provided", async () => {
      const mockCookies = {};
      try {
        await userTokenService.refreshToken(mockCookies);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["notAuthorized"].status);
        expect(error.message).toEqual(errorHandler["notAuthorized"].message);
      }
    });

    it("should throw an error if no refresh token found in the database", async () => {
      userToken.find.mockResolvedValueOnce(undefined);
      try {
        await userTokenService.refreshToken(mockCookies);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["forbidden"].status);
        expect(error.message).toEqual(errorHandler["forbidden"].message);
      }
    });

    it("should throw an error if JWT verification fails", async () => {
      const mockCookies = { refreshToken: "refreshToken" };
      userToken.findOne.mockResolvedValueOnce(mockUserToken);
      jwt.verify.mockReturnValueOnce(null);
      try {
        await userTokenService.refreshToken(mockCookies);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["forbidden"].status);
        expect(error.message).toEqual(errorHandler["forbidden"].message);
      }
    });

    it("should return an access token if all checks pass", async () => {
      const cookies = { refreshToken: "validRefreshToken" };
      userToken.findOne.mockResolvedValueOnce(mockUserToken);
      jwt.verify.mockReturnValueOnce({
        email: "test@example.com",
        userId: mockUserToken.userId,
      });
      generateTokens.generateAccessTokens.mockResolvedValueOnce(
        "mockAccessToken"
      );
      const result = await userTokenService.refreshToken(cookies);
      expect(result).toBe("mockAccessToken");
    });
  });
  describe("revokeToken function", () => {
    it("should return the result of userToken.deleteOne", async () => {
      const cookies = { refreshToken: "validRefreshToken" };
      userToken.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
      const result = await userTokenService.revokeToken(cookies);
      expect(result).toEqual({ deletedCount: 1 });
      expect(userToken.deleteOne).toHaveBeenCalledWith({
        refreshToken: "validRefreshToken",
      });
    });
  });
});
