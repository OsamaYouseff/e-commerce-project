const Product = require("../models/Product");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const router = require("express").Router();


//// dashboard endpoints

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

//CREATE
router.post("/", verifyTokenAndAdmin, upload.single('image'), async (req, res) => {
  const cloudinaryResult = await cloudinary.uploader.upload(req.body.img);


  const newProduct = new Product({
    title: req.body.title,
    desc: req.body.desc,
    img: cloudinaryResult.secure_url, // This path is provided by Cloudinary after upload
    categories: req.body.categories,
    size: req.body.size,
    color: req.body.color,
    price: req.body.price,
    rating: req.body.rating,
    amount: req.body.amount,
    isDeleted: req.body.isDeleted,
  });

  try {
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (err) {
    // If there was an error and we uploaded an image, delete it from Cloudinary
    if (cloudinaryResult && cloudinaryResult.public_id) {
      try {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id);
        console.log(`Deleted image ${cloudinaryResult.public_id} from Cloudinary due to error`);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
      }
    }
    res.status(500).json(err);
  }
})

// UPDATE
router.put("/:id", verifyTokenAndAdmin, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.body["_id"]);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let updateData = { ...req.body };

    // Handle image upload if a new image is provided
    if (`${req.body.img}`.includes("data:image")) {
      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.body.img);
      updateData.img = result.secure_url;

      // Delete old image from Cloudinary if it exists
      if (product.img) {
        const publicId = product.img.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Handle categories if provided as a string
    if (typeof updateData.categories === 'string') {
      updateData.categories = updateData.categories.split(',');
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.body._id,
      { $set: updateData },
      { new: true }
    );

    res.status(201).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    // Clean up the local file if it exists
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting local file:', err);
      });
    }
  }
});

//DELETE
router.delete("/:id/:productId", verifyTokenAndAdmin, async (req, res) => {
  try {

    const deletedProduct = await Product.findById(req.params.productId);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    //// delete image from cloudinary
    if (deletedProduct.img) {
      const publicId = deletedProduct.img.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Product.findByIdAndDelete(req.params.productId);
    res.status(200).json("Product has been deleted successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

//TOGGLE DISABLE PRODUCT
router.patch("/disable/:id/:productId", verifyTokenAndAdmin, async (req, res) => {

  try {
    const deletedProduct = await Product.findById(req.params.productId);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    await Product.findByIdAndUpdate(req.params.productId, { isDeleted: !deletedProduct.isDeleted });

    if (deletedProduct.isDeleted) {
      res.status(200).json({
        message: "Product has been enabled successfully",
        isDeleted: !deletedProduct.isDeleted
      });
    } else {
      res.status(200).json({
        message: "Product has been disabled successfully",
        isDeleted: !deletedProduct.isDeleted
      });
    }

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
    let filter = { isDeleted: false };

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
    const sorting = (`${req.query?.sorting}`.toLowerCase() == "asc" ? 1 : -1) || 1;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch the paginated data
    const items = await Product.find()
      .skip(skip)
      .limit(limit).sort({ createdAt: sorting });

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

/// SEARCH FOR PRODUCT
router.get('/search/:productName', async (req, res) => {
  try {
    const products = await Product.find({ title: { $regex: req.params.productName, $options: 'i' } });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
