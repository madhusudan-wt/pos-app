import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String },
  category: { type: String },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  stockQuantity: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  images: [{ type: String }], // array of image URLs
  variants: [{type: Array}],
  variantCombination:{type:Array}
}, { timestamps: true });

const InventoryItem = mongoose.model("InventoryItem", inventoryItemSchema);

export default InventoryItem;
