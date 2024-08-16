const Product = require("../models/Product");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProduct = new Product(req.body);

  try {
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});


// GET FILTERED PRODUCTS
router.get("/", async (req, res) => {
  try {
    const { categories, size, color } = req.query;
    let filter = {};

    if (categories) {
      const categoryArray = categories.split(',').map(cat => cat.trim());
      filter.categories = { $in: categoryArray };
    }

    if (size) {
      filter.size = size;
    }

    if (color) {
      filter.color = color;
    }

    const products = await Product.find(filter);

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
});


//// GET ALL PRODUCTS WITH PAGINATION
router.get('/all', async (req, res) => {
  try {
    // Get page and limit from query parameters (with defaults)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch the paginated data
    const items = await Product.find()
      .skip(skip)
      .limit(limit);

    // Get the total number of documents
    const total = await Product.countDocuments();

    // Calculate the total number of pages
    const totalPages = Math.ceil(total / limit);

    // Send the paginated data with metadata
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


module.exports = router;
