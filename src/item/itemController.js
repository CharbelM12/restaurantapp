const ItemService = require("./itemService");
const itemService = new ItemService();
const config = require("../configurations/config");
class ItemController {
  async getItems(req, res, next) {
    try {
      const displayedItems = await itemService.getItems(
        req.query.itemName,
        req.query.ingredients,
        req.query.categoryId,
        req.query.price,
        req.query.page || config.defaultPageNumber,
        parseInt(req.query.limit) || config.defaultPagelimit
      );
      res.status(200).send(displayedItems);
    } catch (error) {
      next(error);
    }
  }
  async createItem(req, res, next) {
    try {
      await itemService.createItem(req.body, req.userId);
      res.end();
    } catch (error) {
      next(error);
    }
  }
  async getItem(req, res, next) {
    try {
      const foundItem = await itemService.getItem(req.query.itemId);
      return res.status(200).send(foundItem);
    } catch (error) {
      next(error);
    }
  }
  async updateItem(req, res, next) {
    try {
      const updatedItem = await itemService.updateItem(
        req.query.itemId,
        req.body,
        req.userId
      );
      return res.status(200).send(updatedItem);
    } catch (error) {
      next(error);
    }
  }
  async deleteItem(req, res, next) {
    try {
      const deletedItem = await itemService.deleteItem(req.query.itemId);
      return res.status(200).send(deletedItem);
    } catch (error) {
      next(error);
    }
  }

  async addImage(req, res, next) {
    try {
      await itemService.addImage(req.file.path, req.query.itemId, req.userId);
      return res.end();
    } catch (error) {
      next(error);
    }
  }
}
module.exports = ItemController;
