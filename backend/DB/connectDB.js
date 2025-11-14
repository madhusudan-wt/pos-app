import mongoose from "mongoose";

async function connectDB() {
  try {
    // const conn = await mongoose.connect("mongodb+srv://chetanwebiators:zunURsxCouABRygD@cluster0.xdbgszn.mongodb.net/E-commerce?retryWrites=true&w=majority&appName=Cluster0");
      const conn = await mongoose.connect("mongodb+srv://madhu:madhu%40123@cluster0.1mhunyo.mongodb.net/POS");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
}

export default connectDB