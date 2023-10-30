const userLookup = {
  $lookup: {
    from: "users",
    localField: "userId",
    foreignField: "_id",
    as: "user",
  },
};
const userUnwind = {
  $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
};
const branchLookup = {
  $lookup: {
    from: "branches",
    localField: "branchId",
    foreignField: "_id",
    as: "restaurantBranch",
  },
};
const branchUnwind = {
  $unwind: {
    path: "$restaurantBranch",
    preserveNullAndEmptyArrays: true,
  },
};
const addressLookup = {
  $lookup: {
    from: "addresses",
    localField: "addressId",
    foreignField: "_id",
    as: "address",
  },
};
const addressUnwind = {
  $unwind: { path: "$address", preserveNullAndEmptyArrays: true },
};
const orderProject = {
  $project: {
    orderItems: 1,
    userId: 1,
    userName: "$user.name",
    userEmail: "$user.email",
    userAddress: "$address.completeAddress",
    branchName: "$restaurantBranch.branchName",
    totalPrice: 1,
    status: 1,
    dateOrdered: 1,
  },
};

module.exports = {
  userLookup,
  userUnwind,
  branchLookup,
  branchUnwind,
  addressLookup,
  addressUnwind,
  orderProject,
};
