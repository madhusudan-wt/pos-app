import express from "express";
import InventoryItem from "../DB/models/InventoryItem.js";

const router = express.Router();

// Add a new inventory item
router.post("/add", async (req, res) => {
  try {
    const {
      title,
      sku,
      description,
      category,
      price,
      salePrice,
      stockQuantity,
      status,
      images, // array of Base64 strings
      variants
    } = req.body;

    const newItem = new InventoryItem({
      title,
      sku,
      description,
      category,
      price,
      salePrice,
      stockQuantity,
      status,
      images, // store Base64 strings directly or URLs if you upload them later
      variants
    });

    const savedItem = await newItem.save();
    res.status(201).json({ message: "Item added successfully", data: savedItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add item" });
  }
});

// Get all inventory items
router.get("/", async (req, res) => {
  try {
    const items = await InventoryItem.find();
    res.status(200).json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

export default router;
