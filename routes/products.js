/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API for managing products
 */

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products
 *     responses:
 *       '200':
 *         description: A successful response with the list of products
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - _id: '60c3ad0565db4b00190c4d7b'
 *                   name: 'Product 1'
 *                   description: 'Description of Product 1'
 *                   richDescription: 'Rich description of Product 1'
 *                   image: 'http://example.com/public/uploads/product1.jpg'
 *                   brand: 'Brand 1'
 *                   price: 100
 *                   category: '602e9b718e700335d8532b13'
 *                   countInStock: 10
 *                   rating: 4.5
 *                   numReviews: 20
 *                   isFeatured: true
 *               ...
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: 'Internal Server Error'
 */

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Retrieve a product by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Product ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A successful response with the product details
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 _id: '60c3ad0565db4b00190c4d7b'
 *                 name: 'Product 1'
 *                 description: 'Description of Product 1'
 *                 richDescription: 'Rich description of Product 1'
 *                 image: 'http://example.com/public/uploads/product1.jpg'
 *                 brand: 'Brand 1'
 *                 price: 100
 *                 category: '602e9b718e700335d8532b13'
 *                 countInStock: 10
 *                 rating: 4.5
 *                 numReviews: 20
 *                 isFeatured: true
 *       '404':
 *         description: Product not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: 'Product not found'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: 'Internal Server Error'
 */

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product with the provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       '200':
 *         description: A successful response with the created product
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 _id: '60c3ad0565db4b00190c4d7b'
 *                 name: 'Product 1'
 *                 description: 'Description of Product 1'
 *                 richDescription: 'Rich description of Product 1'
 *                 image: 'http://example.com/public/uploads/product1.jpg'
 *                 brand: 'Brand 1'
 *                 price: 100
 *                 category: '602e9b718e700335d8532b13'
 *                 countInStock: 10
 *                 rating: 4.5
 *                 numReviews: 20
 *                 isFeatured: true
 *       '400':
 *         description: Bad Request - Invalid Category or No image in the request
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: 'Invalid Category'
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               error: 'Internal Server Error'
 */

// ... (Continue adding Swagger comments for other endpoints)

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Product name
 *         description:
 *           type: string
 *           description: Product description
 *         richDescription:
 *           type: string
 *           description: Rich description of the product
 *         image:
 *           type: string
 *           description: Image URL of the product
 *         brand:
 *           type: string
 *           description: Brand of the product
 *         price:
 *           type: number
 *           description: Price of the product
 *         category:
 *           type: string
 *           description: Category ID of the product
 *         countInStock:
 *           type: number
 *           description: Number of items in stock
 *         rating:
 *           type: number
 *           description: Rating of the product
 *         numReviews:
 *           type: number
 *           description: Number of reviews for the product
 *         isFeatured:
 *           type: boolean
 *           description: Indicates if the product is featured
 */

const { Product } = require("../models/product");
const express = require("express");
const Category = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg"
};

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function(req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  }
});

const uploadOptions = multer({ storage: storage });

const generateErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, error: message });
};

router.get(`/`, async (req, res) => {
  try {
    let filter = {};
    if (req.query.categories) {
      filter = { category: req.query.categories.split(",") };
    }

    const productList = await Product.find(filter).populate("category");

    if (!productList) {
      generateErrorResponse(res, 500, "Internal Server Error");
    }
    res.send(productList);
  } catch (error) {
    generateErrorResponse(res, 500, "Internal Server Error");
  }
});

router.get(`/:id`, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      generateErrorResponse(res, 404, "Product not found");
    }
    res.send(product);
  } catch (error) {
    generateErrorResponse(res, 500, "Internal Server Error");
  }
});

router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);

    if (!category) {
      generateErrorResponse(res, 400, "Invalid Category");
    }

    const file = req.file;
    if (!file) {
      generateErrorResponse(res, 400, "No image in the request");
    }

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured
    });

    product = await product.save();

    if (!product) {
      generateErrorResponse(res, 500, "The product cannot be created");
    }

    res.send(product);
  } catch (error) {
    generateErrorResponse(res, 500, "Internal Server Error");
  }
});

router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      generateErrorResponse(res, 400, "Invalid Product Id");
    }

    const category = await Category.findById(req.body.category);
    if (!category) {
      generateErrorResponse(res, 400, "Invalid Category");
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      generateErrorResponse(res, 400, "Invalid Product");
    }

    const file = req.file;
    let imagepath;

    if (file) {
      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      imagepath = `${basePath}${fileName}`;
    } else {
      imagepath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: imagepath,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
      },
      { new: true }
    );

    if (!updatedProduct) {
      generateErrorResponse(res, 500, "The product cannot be updated");
    }

    res.send(updatedProduct);
  } catch (error) {
    generateErrorResponse(res, 500, "Internal Server Error");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndRemove(req.params.id);

    if (product) {
      res.status(200).json({
        success: true,
        message: "The product is deleted!"
      });
    } else {
      generateErrorResponse(res, 404, "Product not found");
    }
  } catch (error) {
    generateErrorResponse(res, 500, "Internal Server Error");
  }
});

router.get(`/get/count`, async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    res.send({
      productCount: productCount
    });
  } catch (error) {
    generateErrorResponse(res, 500, "Internal Server Error");
  }
});

router.get(`/get/featured/:count`, async (req, res) => {
  try {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) {
      generateErrorResponse(res, 500, "Internal Server Error");
    }
    res.send(products);
  } catch (error) {
    generateErrorResponse(res, 500, "Internal Server Error");
  }
});

router.put(
  "/gallery-images/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        generateErrorResponse(res, 400, "Invalid Product Id");
      }

      const files = req.files;
      let imagesPaths = [];
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

      if (files) {
        files.map(file => {
          imagesPaths.push(`${basePath}${file.filename}`);
        });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          images: imagesPaths
        },
        { new: true }
      );

      if (!product) {
        generateErrorResponse(res, 500, "The gallery cannot be updated");
      }

      res.send(product);
    } catch (error) {
      generateErrorResponse(res, 500, "Internal Server Error");
    }
  }
);

module.exports = router;
