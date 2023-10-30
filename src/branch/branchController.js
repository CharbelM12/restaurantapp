const BranchService = require("./branchService");
const branchService = new BranchService();
const config = require("../configurations/config");
class BranchController {
  async getBranches(req, res, next) {
    try {
      const displayedBranches = await branchService.getBranches(
        req.query.branchId,
        req.query.page || config.defaultPageNumber,
        parseInt(req.query.limit) || config.defaultPagelimit
      );
      return res.status(200).send(displayedBranches);
    } catch (error) {
      next(error);
    }
  }
  async createBranch(req, res, next) {
    try {
      await branchService.createBranch(req.body, req.userId);
      return res.end();
    } catch (error) {
      next(error);
    }
  }
  async updateBranch(req, res, next) {
    try {
      const updatedBranch = await branchService.updateBranch(
        req.query.branchId,
        req.body,
        req.userId
      );
      return res.status(200).send(updatedBranch);
    } catch (error) {
      next(error);
    }
  }
  async deleteBranch(req, res, next) {
    try {
      const deletedBranch = await branchService.deleteBranch(
        req.query.branchId
      );
      return res.status(200).send(deletedBranch);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = BranchController;
