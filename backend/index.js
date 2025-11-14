import express from 'express';
import cors from 'cors';
import connectDB from './DB/connectDB.js';
import { getAllProducts } from './controllers/productControllers.js';
import productRoutes from "./routes/productRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Connect to MongoDB
connectDB();

// Routes
// Product routes
app.get("/api/products/getAll", getAllProducts);
app.use("/api/products", productRoutes);

// Inventory routes (NEW)
app.use("/api/inventory", inventoryRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// app.use("/api/inventory", inventoryRoutes);
// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
