const { roundNumbers } = require("../middleware/General");
const Wishlist = require("../models/Wishlist");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();


//CREATE WISHLIST
router.post("/", verifyToken, async (req, res) => {
  ////// make sure that this is the first Wishlist

  const wishlist = await Wishlist.findOne({ userId: req.body.userId });
  if (wishlist) {
    return res.status(400).json({ error: "Wishlist already exists" });
  }

  const newWishlist = new Wishlist(req.body);

  try {
    const savedWishlist = await newWishlist.save();
    res.status(200).json(savedWishlist);
  } catch (err) {
    res.status(500).json(err);
  }
});


//// ADD PRODUCT TO WISHLIST
router.post("/add-product/:id", verifyTokenAndAuthorization, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    // Find the Wishlist for the user
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      // If the Wishlist doesn't exist, create a new one
      wishlist = new Wishlist({
        userId,
        products: [{ productId }],
      });
    } else {
      // Check if the product already exists in the Wishlist
      const productExists = wishlist.products.some(
        (product) => product.productId === productId
      );

      if (productExists) {
        return res.status(400).json({ message: "Product already exists in the Wishlist" });
      }

      // Add the new product to the Wishlist
      wishlist.products.push({ productId });
    }

    // Save the Wishlist
    await wishlist.save();

    // Fetch the updated Wishlist with detailed product information
    const updatedWishlistWithDetails = await Wishlist.aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: "products",
          let: { productIds: "$products.productId" },
          pipeline: [
            { $match: { $expr: { $in: [{ $toString: "$_id" }, "$$productIds"] } } }
          ],
          as: "productDetails"
        }
      },
      {
        $addFields: {
          products: {
            $map: {
              input: "$products",
              as: "wishlistProduct",
              in: {
                $mergeObjects: [
                  "$$wishlistProduct",
                  {
                    productDetails: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$productDetails",
                            cond: { $eq: [{ $toString: "$$this._id" }, "$$wishlistProduct.productId"] }
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
          productDetails: 0
        }
      }
    ]).exec();

    if (!updatedWishlistWithDetails || updatedWishlistWithDetails.length === 0) {
      return res.status(404).json({ message: "Updated Wishlist not found" });
    }

    res.status(200).json(updatedWishlistWithDetails[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating Wishlist", error: err.message });
  }
});


//// REMOVE PRODUCT FROM WISHLIST
router.post("/remove-product/:id", verifyTokenAndAuthorization, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    // Find the Wishlist for the user
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    // Find the product in the Wishlist
    const productIndex = wishlist.products.findIndex(
      (product) => product.productId === productId
    );

    if (productIndex > -1) {
      // Remove the product
      wishlist.products.splice(productIndex, 1);

      // Save the updated Wishlist
      await wishlist.save();

      // Fetch the updated Wishlist with detailed product information
      const updatedWishlistWithDetails = await Wishlist.aggregate([
        { $match: { userId: userId } },
        {
          $lookup: {
            from: "products",
            let: { productIds: "$products.productId" },
            pipeline: [
              { $match: { $expr: { $in: [{ $toString: "$_id" }, "$$productIds"] } } }
            ],
            as: "productDetails"
          }
        },
        {
          $addFields: {
            products: {
              $map: {
                input: "$products",
                as: "wishlistProduct",
                in: {
                  $mergeObjects: [
                    "$$wishlistProduct",
                    {
                      productDetails: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$productDetails",
                              cond: { $eq: [{ $toString: "$$this._id" }, "$$wishlistProduct.productId"] }
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
            productDetails: 0
          }
        }
      ]).exec();

      if (!updatedWishlistWithDetails || updatedWishlistWithDetails.length === 0) {
        return res.status(404).json({ message: "Updated Wishlist not found" });
      }

      res.status(200).json(updatedWishlistWithDetails[0]);
    } else {
      return res.status(404).json({ message: "Product not found in Wishlist" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error removing product from Wishlist", error: err.message });
  }
});


// CLEAR WISHLIST
router.put("/clear/:id", verifyTokenAndAuthorization, async (req, res) => {
  const userId = req.user.id;

  try {
    // Find the Wishlist by userId and update it
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { userId: userId },
      { $set: { products: [] } },
      { new: true }
    );

    if (!updatedWishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    res.status(200).json({
      message: "Wishlist cleared successfully",
      wishlist: updatedWishlist
    });
  } catch (err) {
    console.error("Error clearing wishlist:", err);
    res.status(500).json({ message: "Error clearing wishlist", error: err.message });
  }
});

// DELETE WISHLIST
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  const userId = req.user.id;

  try {
    // Find and delete the Wishlist by userId
    const deletedWishlist = await Wishlist.findOneAndDelete({ userId: userId });

    if (!deletedWishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    res.status(200).json({ message: "Wishlist has been deleted successfully" });
  } catch (err) {
    console.error("Error deleting wishlist:", err);
    res.status(500).json({ message: "Error deleting wishlist", error: err.message });
  }
});

//GET WISHLIST WITH USER ID
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.id });
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json(err);
  }
});


//GET ALL WISHLISTS
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const wishlists = await Wishlist.find();
    res.status(200).json(wishlists);
  } catch (err) {
    res.status(500).json(err);
  }
});


// Get all Wishlists with detailed product information
router.get("/wishlist_detailed_products/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const userId = req.params.id;

    let wishlist = await Wishlist.aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: "products",
          let: { productIds: "$products.productId" },
          pipeline: [
            { $match: { $expr: { $in: [{ $toString: "$_id" }, "$$productIds"] } } }
          ],
          as: "productDetails"
        }
      },
      {
        $addFields: {
          products: {
            $map: {
              input: "$products",
              as: "wishlistProduct",
              in: {
                $mergeObjects: [
                  "$$wishlistProduct",
                  {
                    productDetails: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$productDetails",
                            cond: { $eq: [{ $toString: "$$this._id" }, "$$wishlistProduct.productId"] }
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
          productDetails: 0
        }
      }
    ]).exec();

    if (!wishlist || wishlist.length === 0) {
      return res.status(404).json({ message: "Wishlist not found for the given user ID" });
    }

    // Check if the Wishlist has products
    if (wishlist[0].products.length === 0) {
      return res.status(200).json(wishlist[0]);
    }

    res.status(200).json(wishlist[0]);
  } catch (err) {
    console.error(`Error fetching Wishlist for user ID: ${req.params.id}`, err);
    res.status(500).json({ message: "Error fetching Wishlist", error: err.message });
  }
});



// Check if product is in Wishlist
router.get("/check-product/:id/:productId", verifyTokenAndAuthorization, async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.productId;

  try {
    // Find the Wishlist for the user
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found", isInWishlist: false });
    }

    // Check if the product exists in the Wishlist
    const isInWishlist = wishlist.products.some(
      (product) => product.productId === productId
    );

    res.status(200).json({ isInWishlist });
  } catch (err) {
    console.error("Error checking product in wishlist:", err);
    res.status(500).json({ message: "Error checking product in wishlist", error: err.message });
  }
});


module.exports = router;
