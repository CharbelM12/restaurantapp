const express = require("express");
const router = express.Router();
const BranchController = require("./branchController");
const branchController = new BranchController();
const branchValidation = require("./branchValidation");
const { validate } = require("express-validation");
const middleware = require("../middlewares/middleware");

router.get(
  "/list",
  middleware.isAuth,
  middleware.isAdmin,
  validate(branchValidation.getBranches),
  branchController.getBranches
);

router.post(
  "/",
  middleware.isAuth,
  middleware.isAdmin,
  validate(branchValidation.createBranch),
  branchController.createBranch
);
router.put(
  "/",
  middleware.isAuth,
  middleware.isAdmin,
  validate(branchValidation.updateBranch),
  branchController.updateBranch
);

router.delete(
  "/",
  middleware.isAuth,
  middleware.isAdmin,
  validate(branchValidation.getOrDeleteBranch),
  branchController.deleteBranch
);

module.exports = router;
