const AddressService = require("./addressService");
const addressService = new AddressService();
const config = require("../configurations/config");

class AddressController {
  async getAddresses(req, res, next) {
    try {
      const foundAddresses = await addressService.getAddresses(
        req.userId,
        req.query.addressId,
        req.query.page || config.defaultPageNumber,
        parseInt(req.query.limit) || config.defaultPagelimit
      );
      return res.status(200).send(foundAddresses);
    } catch (error) {
      next(error);
    }
  }
  async getAddress(req, res, next) {
    try {
      const foundAddress = await addressService.getAddress(
        req.query.addressId,
        req.userId
      );
      return res.status(200).send(foundAddress);
    } catch (error) {
      next(error);
    }
  }
  async createAddress(req, res, next) {
    try {
      await addressService.createAddress(req.body, req.userId);
      return res.end();
    } catch (error) {
      next(error);
    }
  }
  async updateAddress(req, res, next) {
    try {
      const updatedAddress = await addressService.updateAddress(
        req.query.addressId,
        req.body,
        req.userId
      );
      return res.status(200).send(updatedAddress);
    } catch (error) {
      next(error);
    }
  }
  async deleteAddress(req, res, next) {
    try {
      const deletedAddress = await addressService.deleteAddress(
        req.query.addressId,
        req.userId
      );
      return res.status(200).send(deletedAddress);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AddressController;
