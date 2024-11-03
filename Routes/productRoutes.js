const express = require("express");
const formidable = require("formidable");
const router = express.Router();
const {
  authenticateAccessToken,
} = require("../middleware/authenticateAccessToken");
const { isAdmin } = require("../middleware/isAdmin");
const Products = require("../models/product");
const fs = require("fs")
const path = require('path');

// Get all products with pagination
router.get("/", async (req, res) => {
  /* Pagination */
  const pages = parseInt(req.query.page) || 1;
  const productItemCount = parseInt(req.query.item_count) || 10;
  const skip = (pages - 1) * productItemCount;
  const totalItems = await Products.countDocuments();
  const totalPages = Math.ceil(totalItems / productItemCount);

  try {
    const products = await Products.find().skip(skip).limit(productItemCount);
    res.json({ products, pages, totalPages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific product by ID
router.get("/product/:id", async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new product
router.post("/add", authenticateAccessToken, isAdmin, async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true
    form.parse(req, async (err, fields, files) => {
      const gallery = []

      files.gallery.map(img => {
        const extension = img.originalFilename.split(".")[1]

        const tempPath = img.filepath
        const fileName = `${img.newFilename}.${extension}`
        const newPath = path.join('images', fileName)
        const data = fs.readFileSync(tempPath)

        gallery.push(`http://localhost:5001/images/${fileName}`)

        fs.writeFile(newPath, data, (err) => {
          if (err) {
            console.error("Error while uploading the image:", err)
          } else {
            console.log("Image successfully updated")
          }
        })
      })

      const product = new Products({
        title: fields.title[0],
        description: fields.description[0],
        price: fields.price[0],
        gallery: gallery,
        category: fields.category[0],
        stock: fields.stock[0],
      });

      const newProduct = await product.save();
      res.status(201).json(newProduct);

    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add image to product
router.post("/addImage", (req, res) => {
  // Set the region and access keys
  AWS.config.update({
    region: "us-east-1",
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  });

  // Create a new instance of the S3 class
  const s3 = new AWS.S3();

  const form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    const filePath = files.file[0].filepath;
    // Set the parameters for the file you want to upload
    const params = {
      Bucket: "product-images-ecommerce111",
      Key: files.file[0].originalFilename,
      Body: fs.createReadStream(filePath),
    };

    // Upload the file to S3
    s3.upload(params, (err, data) => {
      res.send(data.Location);
    });
  });
});

// Update a product by ID
router.put("/edit/:id", authenticateAccessToken, isAdmin, async (req, res) => {
  try {
    const form = new formidable.IncomingForm();

    form.parse(req, async function (err, fields, files) {
      const {
        title,
        description,
        price,
        gallery,
        category,
        currency,
        stock,
        size,
        color,
        deletedImages
      } = fields;

      const filesToAdd = []

      files?.gallery?.map(img => {
        const extension = img.originalFilename.split(".")[1]

        const tempPath = img.filepath
        const fileName = `${img.newFilename}.${extension}`
        const newPath = path.join('images', fileName)
        const data = fs.readFileSync(tempPath)

        filesToAdd.push(`http://localhost:5001/images/${fileName}`)

        fs.writeFile(newPath, data, (err) => {
          if (err) {
            console.error("Error while uploading the image:", err)
          } else {
            console.log("Image successfully updated")
          }
        })
      })

      if(deletedImages?.length && deletedImages[0] !== ''){
        deletedImages.map(image => {
          console.log("Delete run")
          const imgArr = image.split("/")
          const imgName = imgArr[imgArr.length - 1]
  
          fs.unlinkSync(path.join(__dirname,  '../images', imgName));
        })
      }

      const updatedProduct = await Products.findByIdAndUpdate(
        req.params.id,
        {
          title: title[0],
          description: description[0],
          price: price[0],
          gallery: [...filesToAdd, ...gallery],
          category: category[0],
          currency: currency[0],
          stock: stock[0],
          ...(size ? { size: size[0] } : {}),
          ...(color ? { color: color } : {}),
        },
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json(updatedProduct);
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a product by ID
router.delete(
  "/delete/:id",
  authenticateAccessToken,
  isAdmin,
  async (req, res) => {
    try {
      const product = await Products.findByIdAndDelete(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Product Search
router.get("/search/:searchThem", async (req, res) => {
  try {
    const searchValue = req.params.searchThem;
    const results = await Products.find({
      $or: [
        { title: { $regex: searchValue, $options: "i" } },
        { description: { $regex: searchValue, $options: "i" } },
      ],
    });
    res.json(results);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
