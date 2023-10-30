module.exports = {
  invalidCredentials: {
    status: 401,
    message: "the credentials you have entered are incorrect",
  },
  lockedAccount: {
    status: 423,
    message: "You account has been locked. Try again after 10 minutes",
  },
  userMissing: {
    status: 404,
    message: "User not found",
  },
  forbidden: {
    status: 403,
    message: "forbidden",
  },
  notAuthorized: {
    status: 401,
    message: "Unauthorized",
  },
  invalidToken: {
    status: 404,
    message: "the token you have entered is invalid",
  },
  itemMissing: {
    status: 404,
    message: "No item found",
  },
  emailMissing: {
    status: 404,
    message: "No account associated with this email address was found",
  },
  orderBranchMissing: {
    status: 404,
    message: "Sorry we don't have any brand close to your location",
  },
  orderMissing: {
    status: 404,
    message: "No Order found",
  },
  addressMissing: {
    status: 404,
    message: "No Address found",
  },
  notConnected: {
    status: 502,
    message: "Failed to connect to database",
  },
  emailExists: {
    status: 409,
    message: "Email address already exists. Please enter another one.",
  },
  failedEmail: {
    status: 550,
    message: "Failed to send email",
  },
  disabled: {
    status: 423,
    message: "You account has been disabled.",
  },
};
