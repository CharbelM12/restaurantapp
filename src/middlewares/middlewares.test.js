const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const middleware = require("./middleware");
const errorHandlerMiddleware = require("./errorHandler");
const expressValidation = require("express-validation");
const user = require("../user/userModel");
const errorHandler = require("../errors");

jest.mock("../user/userModel");
jest.mock("jsonwebtoken");
jest.mock("express-validation");

const mockReq = {
  cookies: {
    accessToken: "mockAccessToken",
  },
};

const mockRes = {
  status: jest.fn(() => mockRes),
  json: jest.fn(() => mockRes),
};
const mockNext = jest.fn();
const mockUserId = new mongoose.Types.ObjectId();

describe("middlewares", () => {
  describe("isAuth middleware", () => {
    it("should set req.userId if accessToken is valid", () => {
      jwt.verify.mockReturnValueOnce({ userId: mockUserId });
      middleware.isAuth(mockReq, mockRes, mockNext);
      expect(mockReq).toHaveProperty("userId");
      expect(mockReq.userId).toBe(mockUserId);
      expect(jwt.verify).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it("should throw an error if accessToken is missing", () => {
      const mockReq = {
        cookies: {
          accessToken: undefined,
        },
      };
      try {
        middleware.isAuth(mockReq, mockRes, mockNext);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["notAuthorized"].status);
        expect(error.message).toEqual(errorHandler["notAuthorized"].message);
      }

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw an error if accessToken is invalid", () => {
      jwt.verify.mockReturnValueOnce(undefined);
      try {
        middleware.isAuth(mockReq, mockRes, mockNext);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["notAuthorized"].status);
        expect(error.message).toEqual(errorHandler["notAuthorized"].message);
      }
      expect(jwt.verify).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("isAdmin middleware", () => {
    it("should call next when the user is an admin", async () => {
      user.findById.mockResolvedValueOnce({ role: "admin" });
      await middleware.isAdmin(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when the user is not an admin", async () => {
      user.findById.mockResolvedValueOnce({ role: "user" });
      try {
        await middleware.isAdmin(mockReq, mockRes, mockNext);
      } catch (error) {
        expect(error.status).toEqual(errorHandler["forbidden"].status);
        expect(error.message).toEqual(errorHandler["forbidden"].message);
        expect(mockNext).toHaveBeenCalledWith(error);
      }
    });
  });
  describe("errorHanlder middleware", () => {
    it("should handle an internal server error when no error specific is provided", () => {
      const mockError = { status: undefined, message: undefined };
      errorHandlerMiddleware(mockError, mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
    });
    it("should handle a custom error with status and message", () => {
      const mockError = { status: 404, message: "Not Found" };
      errorHandlerMiddleware(mockError, mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Not Found" });
    });
    it("should handle expressvalidation.ValidationError", () => {
      const mockError = new expressValidation.ValidationError();
      mockError.message = "Validation failed";
      errorHandlerMiddleware(mockError, mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Validation failed" });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
