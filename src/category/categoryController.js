const CategoryService = require("./categoryService");
const categoryService = new CategoryService();
const config = require("../configurations/config");
class CategoryController {
  async createCategory(req, res, next) {
    try {
      await categoryService.createCategory(req.body, req.userId);
      return res.end();
    } catch (error) {
      next(error);
    }
  }
  async getCategories(req, res, next) {
    try {
      const foundCategories = await categoryService.getCategories(
        req.query.categoryId,
        req.query.page || config.defaultPageNumber,
        parseInt(req.query.limit) || config.defaultPagelimit
      );
      return res.status(200).send(foundCategories);
    } catch (error) {
      next(error);
    }
  }
  async updateCategory(req, res, next) {
    try {
      const updatedCategory = await categoryService.updateCategory(
        req.query.categoryId,
        req.body,
        req.userId
      );
      return res.status(200).send(updatedCategory);
    } catch (error) {
      next(error);
    }
  }
  async deleteCategory(req, res, next) {
    try {
      const deletedCategory = await categoryService.deleteCategory(
        req.query.categoryId
      );
      return res.status(200).send(deletedCategory);
    } catch (error) {
      next(error);
    }
  }
  async sortCategories(req, res, next) {
    try {
      const sortedCategories = await categoryService.sortCategories(req.body);
      return res.status(200).send(sortedCategories);
    } catch (error) {
      next(error);
    }
  }
  async addImage(req, res, next) {
    try {
      await categoryService.addImage(
        req.file.path,
        req.query.categoryId,
        req.userId
      );
      return res.end();
    } catch (error) {
      next(error);
    }
  }
}
module.exports = CategoryController;
