const Order = require("../models/Order");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const router = require("express").Router();
const mongoose = require('mongoose');

//CREATE
router.post("/:id", verifyTokenAndAuthorization, async (req, res) => {

  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json(err);
  }
});

// -----------------------------
//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE ORDER STATUS FOR ADMINS
router.patch("/:orderId/:status", verifyTokenAndAdmin, async (req, res) => {
  try {
    const validStatuses = ["pending", "processing", "delivered", "canceled"];
    const { orderId, status } = req.params;

    if (!validStatuses.includes(status)) {
      return res.status(400).json("Invalid order status");
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json("Order not found");
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// -----------------------------
//DELETE
//// FOR ADMINS USERS
router.delete("/:id/:orderId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.orderId);
    res.status(200).json("Order has been deleted successfully.");
  } catch (err) {
    res.status(500).json(err);
  }
});

//// FOR ADMINS ADMINS
router.delete("/:orderId", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.orderId);
    res.status(200).json("Order has been deleted successfully.");
  } catch (err) {
    res.status(500).json(err);
  }
});
// -----------------------------

//GET USER ORDERS
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.id });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// -----------------------------
// GET A SPECIFIC ORDER WITH FULL DETAILS
//// FOR ADMINS ONLY
router.get('/detailed/:orderId', verifyTokenAndAdmin, async (req, res) => {
  try {
    const orderId = mongoose.Types.ObjectId(req.params.orderId);

    const result = await Order.aggregate([
      { $match: { _id: orderId } },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $addFields: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                _id: "$$item.productId",
                title: {
                  $arrayElemAt: [
                    "$productDetails.title",
                    { $indexOfArray: ["$productDetails._id", "$$item.productId"] }
                  ]
                },
                img: {
                  $arrayElemAt: [
                    "$productDetails.img",
                    { $indexOfArray: ["$productDetails._id", "$$item.productId"] }
                  ]
                },
                priceAtOrderInCents: "$$item.priceAtOrderInCents",
                quantity: "$$item.quantity"
              }
            }
          }
        }
      },
      {
        $project: {
          financials: 1,
          shippingInfo: 1,
          _id: 1,
          userId: 1,
          items: 1,
          shippingAddress: 1,
          status: 1,
          paymentMethod: 1,
          createdAt: 1
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'Order not found for this user' });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//// For USERS ONLY
router.get('/detailed/:id/:orderId', verifyTokenAndAuthorization, async (req, res) => {

  try {
    const userId = mongoose.Types.ObjectId(req.params.id);
    const orderId = mongoose.Types.ObjectId(req.params.orderId);

    const result = await Order.aggregate([
      { $match: { _id: orderId, userId: userId } },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $addFields: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                _id: "$$item.productId",
                title: {
                  $arrayElemAt: [
                    "$productDetails.title",
                    { $indexOfArray: ["$productDetails._id", "$$item.productId"] }
                  ]
                },
                img: {
                  $arrayElemAt: [
                    "$productDetails.img",
                    { $indexOfArray: ["$productDetails._id", "$$item.productId"] }
                  ]
                },
                priceAtOrderInCents: "$$item.priceAtOrderInCents",
                quantity: "$$item.quantity"
              }
            }
          }
        }
      },
      {
        $project: {
          financials: 1,
          shippingInfo: 1,
          _id: 1,
          userId: 1,
          items: 1,
          shippingAddress: 1,
          status: 1,
          paymentMethod: 1,
          createdAt: 1
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'Order not found for this user' });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------

// GET MINIMIZED ORDERS
////GET ALL ORDERS MINIMIZED FOR ADMIN ONLY
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sorting = (req.query?.sorting?.toLowerCase() === "asc" ? 1 : -1) || 1;

    const skip = (page - 1) * limit;

    const items = await Order.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          username: '$user.username',
          totalAmountInCents: '$financials.totalAmountInCents',
          status: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: sorting } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const total = await Order.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: items,
      meta: {
        total,
        page,
        totalPages,
        limit
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//// GET ALL ORDER MINIMIZED FOR USER ONLY
router.get('/min/:id', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const userId = mongoose.Types.ObjectId(req.params.id);

    const result = await Order.aggregate([
      { $match: { userId: userId } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$_id",
          status: { $first: "$status" },
          estimatedDeliveryDate: { $first: "$shippingInfo.estimatedDeliveryDate" },
          items: {
            $push: {
              _id: "$productDetails._id",
              title: "$productDetails.title",
              img: "$productDetails.img"
            }
          }
        }
      },
      {
        $project: {
          orderId: "$_id",
          items: 1,
          status: 1,
          estimatedDeliveryDate: 1,
          _id: 0
        }
      }
    ]);

    // if (result.length === 0) {
    //   return res.status(404).json({ message: 'No orders found for this user' });
    // }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// -----------------------------

module.exports = router;


// // GET MONTHLY INCOME
// router.get("/income", verifyTokenAndAdmin, async (req, res) => {
//   const date = new Date();
//   const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
//   const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

//   try {
//     const income = await Order.aggregate([
//       { $match: { createdAt: { $gte: previousMonth } } },
//       {
//         $project: {
//           month: { $month: "$createdAt" },
//           sales: "$amount",
//         },
//       },
//       {
//         $group: {
//           _id: "$month",
//           total: { $sum: "$sales" },
//         },
//       },
//     ]);
//     res.status(200).json(income);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });