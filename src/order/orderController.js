const OrderService = require("./orderService");
const orderConfig = require("./orderConfig");
const orderService = new OrderService();
const config = require("../configurations/config");

class OrderController {
  async getOrders(req, res, next) {
    try {
      const foundOrders = await orderService.getOrders(
        req.userId,
        req.query.page || config.defaultPageNumber,
        parseInt(req.query.limit) || config.defaultPagelimit
      );
      return res.status(200).send(foundOrders);
    } catch (error) {
      next(error);
    }
  }
  async getOrder(req, res, next) {
    try {
      const foundOrder = await orderService.getOrder(
        req.userId,
        req.query.orderId
      );
      return res.status(200).send(foundOrder);
    } catch (error) {
      next(error);
    }
  }
  async adminOrders(req, res, next) {
    try {
      const foundOrders = await orderService.adminOrders(
        req.query.orderId,
        req.query.page || config.defaultPageNumber,
        parseInt(req.query.limit) || config.defaultPagelimit
      );
      return res.status(200).send(foundOrders);
    } catch (error) {
      next(error);
    }
  }
  async createOrder(req, res, next) {
    try {
      await orderService.createOrder(req.body, req.userId);
      return res.end();
    } catch (error) {
      next(error);
    }
  }
  async updateOrder(req, res, next) {
    try {
      const updatedOrder = await orderService.updateorder(
        req.query.orderId,
        req.body,
        req.userId
      );
      return res.status(200).send(updatedOrder);
    } catch (error) {
      next(error);
    }
  }
  async cancelOrder(req, res, next) {
    try {
      const canceledOrder = await orderService.cancelOrder(
        req.query.orderId,
        req.userId
      );
      return res.status(200).send(canceledOrder);
    } catch (error) {
      next(error);
    }
  }
  async acceptOrder(req, res, next) {
    try {
      const acceptedOrder = await orderService.acceptOrRejectOrder(
        req.query.orderId,
        orderConfig.acceptedStatus
      );
      return res.status(200).send(acceptedOrder);
    } catch (error) {
      next(error);
    }
  }
  async rejectOrder(req, res, next) {
    try {
      const rejectedOrder = await orderService.acceptOrRejectOrder(
        req.query.orderId,
        orderConfig.rejectedStatus
      );
      return res.status(200).send(rejectedOrder);
    } catch (error) {
      next(error);
    }
  }
  async getHistory(req, res, next) {
    try {
      const foundOrders = await orderService.getHistory(
        req.userId,
        req.query.page || config.defaultPageNumber,
        parseInt(req.query.limit) || config.defaultPagelimit
      );
      return res.status(200).send(foundOrders);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;
