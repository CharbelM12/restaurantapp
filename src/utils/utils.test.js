const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const generateTokens = require("./jwt");
const userToken = require("../userToken/userTokenModel");
const config=require("../configurations/config")

jest.mock("jsonwebtoken");
jest.mock("../userToken/userTokenModel");
const mockPayload = {
  email: "test@test.com",
  userId: new mongoose.Types.ObjectId(),
};
const mockAccessToken = "mockAccessToken";
describe("generateTokens", () => {
  describe("generateAccessToken function", () => {
    it("should generate a valid access token with the correct payload", async () => {
      jwt.sign.mockReturnValueOnce("mockAccessToken");
      const accessToken = await generateTokens.generateAccessTokens(
        mockPayload
      );
      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, expect.any(String), {
        expiresIn: config.accessTokenExpiry,
      });
      expect(accessToken).toEqual("mockAccessToken");
    });
  });
  describe("generateRefreshToken function", () => {
    it("should generate a valid refresh token and save it to the database", async () => {
      jwt.sign.mockReturnValueOnce("mockRefreshToken");
      userToken.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
      userToken.prototype.save.mockResolvedValueOnce({
        userId: mockPayload.userId,
        refreshToken: "mockRefreshToken",
      });
      const refreshToken = await generateTokens.generateRefreshTokens(
        mockPayload
      );
      expect(jwt.sign).toHaveBeenCalledWith(mockPayload, expect.any(String), {
        expiresIn: "1d",
      });
      expect(userToken.deleteOne).toHaveBeenCalledWith({
        userId: mockPayload.userId,
      });
      expect(userToken.prototype.save).toHaveBeenCalled();
      expect(refreshToken).toBe("mockRefreshToken");
    });
  });
});
