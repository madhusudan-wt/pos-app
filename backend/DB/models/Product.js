import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    image: [{ type: String }],
    status: { type: String },
    title: { type: String,  },
    handle: { type: String, default: "" },
    description: { type: String },
    price: { type: Number },
    salePrice: { type: Number },
    totalStock: { type: Number },
  },
  { timestamps: true }
);


const Product  =  mongoose.model("Product", productSchema);
export default Product 