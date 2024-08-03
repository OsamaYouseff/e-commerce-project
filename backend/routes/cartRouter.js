const { roundNumbers } = require("../middleware/General");
const Cart = require("../models/Cart");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();


//CREATE

router.post("/", verifyToken, async (req, res) => {
  ////// make sure that this is the first cart

  const cart = await Cart.findOne({ userId: req.body.userId });
  if (cart) {
    return res.status(400).json({ error: "Cart already exists" });
  }

  const newCart = new Cart(req.body);

  try {
    const savedCart = await newCart.save();
    res.status(200).json(savedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { userID: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json({ message: "Error updating cart", error: err });
  }
});

//// ADD PRODUCT TO CART
router.post("/add_update-product/:id", verifyTokenAndAuthorization, async (req, res) => {
  const { productId, quantity, price } = req.body;
  const userId = req.user.id;

  try {
    // Find the cart for the user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // If the cart doesn't exist, create a new one
      cart = new Cart({
        userId,
        products: [{ productId, quantity }],
        totalPrice: quantity * price,
      });

      cart.totalPrice = roundNumbers(cart.totalPrice);
    } else {
      // Check if the product already exists in the cart
      const productIndex = cart.products.findIndex(
        (product) => product.productId === productId
      );

      if (productIndex > -1) {
        const diffQuantity = quantity - cart.products[productIndex].quantity;
        cart.products[productIndex].quantity = quantity;
        cart.totalPrice += diffQuantity * price;
        cart.totalPrice = roundNumbers(cart.totalPrice);
      } else {
        // If product doesn't exist, add it to the cart
        cart.products.push({ productId, quantity });
        cart.totalPrice += quantity * price;
        cart.totalPrice = roundNumbers(cart.totalPrice);
      }
    }

    // Save the cart
    await cart.save();

    // Fetch the updated cart with detailed product information
    const updatedCartWithDetails = await Cart.aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: "products",
          let: { products: "$products" },
          pipeline: [
            { $match: { $expr: { $in: [{ $toString: "$_id" }, "$$products.productId"] } } }
          ],
          as: "allProductDetails"
        }
      },
      {
        $addFields: {
          products: {
            $map: {
              input: "$products",
              as: "cartProduct",
              in: {
                $mergeObjects: [
                  "$$cartProduct",
                  {
                    productDetails: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$allProductDetails",
                            cond: { $eq: [{ $toString: "$$this._id" }, "$$cartProduct.productId"] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          allProductDetails: 0
        }
      }
    ]).exec();

    if (!updatedCartWithDetails || updatedCartWithDetails.length === 0) {
      return res.status(404).json({ message: "Updated cart not found" });
    }

    res.status(200).json(updatedCartWithDetails[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating cart", error: err.message });
  }
});


//// REMOVE PRODUCT FROM CART
router.post("/remove-product/:id", verifyTokenAndAuthorization, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    // Find the cart for the user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product in the cart
    const productIndex = cart.products.findIndex(
      (product) => product.productId === productId
    );

    if (productIndex > -1) {
      // Get the product details to update the total price
      const productDetails = cart.products[productIndex];

      // Remove the product and update the total price
      cart.totalPrice -= productDetails.quantity * req.body.price; // Make sure the price is correctly provided or fetched
      cart.products.splice(productIndex, 1);

      if (cart.products.length === 0) cart.totalPrice = 0;

      // Save the updated cart
      await cart.save();

      // Fetch the updated cart with detailed product information
      const updatedCartWithDetails = await Cart.aggregate([
        { $match: { userId: userId } },
        {
          $lookup: {
            from: "products",
            let: { products: "$products" },
            pipeline: [
              { $match: { $expr: { $in: [{ $toString: "$_id" }, "$$products.productId"] } } }
            ],
            as: "allProductDetails"
          }
        },
        {
          $addFields: {
            products: {
              $map: {
                input: "$products",
                as: "cartProduct",
                in: {
                  $mergeObjects: [
                    "$$cartProduct",
                    {
                      productDetails: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$allProductDetails",
                              cond: { $eq: [{ $toString: "$$this._id" }, "$$cartProduct.productId"] }
                            }
                          },
                          0
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $project: {
            allProductDetails: 0
          }
        }
      ]).exec();

      if (!updatedCartWithDetails || updatedCartWithDetails.length === 0) {
        return res.status(404).json({ message: "Updated cart not found" });
      }

      res.status(200).json(updatedCartWithDetails[0]);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error removing product from cart", error: err.message });
  }
});


////// CLEAR CART
router.put("/clear/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        $set: { products: [] },
      },
      { new: true }
    );
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});


//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json("Cart has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET CART WITH USER ID
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.id });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json(err);
  }
});


// Get all carts with detailed product information
router.get("/cart_detailed_products/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const userId = req.params.id;

    let cart = await Cart.aggregate([
      // Match the cart by userId
      {
        $match: { userId: userId }
      },
      // Lookup product details
      {
        $lookup: {
          from: "products",
          let: { products: "$products" },
          pipeline: [
            { $match: { $expr: { $in: [{ $toString: "$_id" }, "$$products.productId"] } } },
            {
              $project: {
                _id: 1,
                title: 1,
                desc: 1,
                img: 1,
                categories: 1,
                size: 1,
                color: 1,
                price: 1,
                rating: 1
              }
            }
          ],
          as: "allProductDetails"
        }
      },
      // Add product details to each product in the cart
      {
        $addFields: {
          products: {
            $map: {
              input: "$products",
              as: "cartProduct",
              in: {
                $mergeObjects: [
                  "$$cartProduct",
                  {
                    productDetails: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$allProductDetails",
                            cond: { $eq: [{ $toString: "$$this._id" }, "$$cartProduct.productId"] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      // Compute total price dynamically
      {
        $addFields: {
          totalPrice: {
            $sum: {
              $map: {
                input: "$products",
                as: "product",
                in: {
                  $multiply: [
                    { $ifNull: ["$$product.quantity", 0] },
                    { $ifNull: ["$$product.productDetails.price", 0] }
                  ]
                }
              }
            }
          }
        }
      },
      // Remove the temporary allProductDetails field
      {
        $project: {
          allProductDetails: 0
        }
      }
    ]).exec();

    if (!cart || cart.length === 0) {
      return res.status(404).json({ message: "Cart not found for the given user ID" });
    }

    // Check if the cart has products
    if (cart[0].products.length === 0) {
      return res.status(200).json(cart[0]);
    }

    res.status(200).json(cart[0]);
  } catch (err) {
    console.error(`Error fetching cart for user ID: ${req.params.id}`, err);
    res.status(500).json({ message: "Error fetching cart", error: err.message });
  }
});




// router.get("/cart_detailed_products/:id", verifyTokenAndAuthorization, async (req, res) => {
//   try {
//     const userId = req.params.id;


//     let cart = await Cart.aggregate([
//       // Match the cart by userId
//       {
//         $match: { userId: userId }
//       },
//       // Lookup product details
//       {
//         $lookup: {
//           from: "products",
//           let: { products: "$products" },
//           pipeline: [
//             { $match: { $expr: { $in: [{ $toString: "$_id" }, "$$products.productId"] } } }
//           ],
//           as: "allProductDetails"
//         }
//       },
//       // Add product details to each product in the cart
//       {
//         $addFields: {
//           products: {
//             $map: {
//               input: "$products",
//               as: "cartProduct",
//               in: {
//                 $mergeObjects: [
//                   "$$cartProduct",
//                   {
//                     productDetails: {
//                       $arrayElemAt: [
//                         {
//                           $filter: {
//                             input: "$allProductDetails",
//                             cond: { $eq: [{ $toString: "$$this._id" }, "$$cartProduct.productId"] }
//                           }
//                         },
//                         0
//                       ]
//                     }
//                   }
//                 ]
//               }
//             }
//           }
//         }
//       },
//       // Remove the temporary allProductDetails field
//       {
//         $project: {
//           allProductDetails: 0
//         }
//       }
//     ]).exec();

//     if (!cart || cart.length === 0) {
//       return res.status(404).json({ message: "Cart not found for the given user ID" });
//     }

//     // Check if the cart has products
//     if (cart[0].products.length === 0) {
//       return res.status(200).json(cart[0]);
//     }

//     res.status(200).json(cart[0]);
//   } catch (err) {
//     // console.error(`Error fetching cart for user ID: ${req.params.id}`, err);
//     res.status(500).json({ message: "Error fetching cart", error: err.message });
//   }
// });


module.exports = router;
