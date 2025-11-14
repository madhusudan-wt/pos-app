import express from "express";
import Product from "../DB/models/Product.js";

const router = express.Router();

// POST /api/products/add
router.post("/add", async (req, res) => {
  try {
    const {
      title,
      handle,
      description,
      status,
      price,
      salePrice,
      totalStock,
      image
    } = req.body;

    const product = new Product({
      title,
      handle,
      description,
      status,
      price,
      salePrice,
      totalStock,
      image,
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error("Error saving product:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});


export default router;
