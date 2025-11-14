// routes/inventory.js
import express from "express";
import Inventory from "../DB/models/InventoryItem.js"; // make sure this path is correct

const router = express.Router();

// ✅ Get all inventory items
router.get("/allinventory", async (req, res) => {
  try {
    const items = await Inventory.find();
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Add inventory item
router.post("/add", async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    await newItem.save();
    res.status(201).json({ message: "Item added successfully" });
  } catch (error) {
    console.error("Error adding inventory item:", error);
    res.status(500).json({ error: "Failed to add item" });
  }
});

router.put("/update/:id" , async(req,res)=>{
     const {id} = req.params;
    try {
        const updatedItem =  await Inventory.findByIdAndUpdate(
            id,
            req.body,
            {new : true}
        );
        if(!updatedItem){
            return res.status(404).json({error:"Item not found"});

        }
       res.status(200).json({ message: "Item updated successfully", data: updatedItem });
    } catch (error) {
        console.error("Error updating inventory:", err);
        res.status(500).json({ error: "Failed to update item" });
    }
});
router.get("/:id" , async(req,res)=>{
     const {id} = req.params;
    try {
        const item =  await Inventory.findById(
            id
        );
        if(!item){
            return res.status(404).json({error:"Item not found"});

        }
       res.status(200).json({ message: "Item found", data: item });
    } catch (error) {
        console.error("Error getting single item in  inventory:", err);
        res.status(500).json({ error: "Failed to fetch item" });
    }
});

// ✅ Delete inventory item
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedItem = await Inventory.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json({ message: "Item deleted successfully", data: deletedItem });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    res.status(500).json({ error: "Failed to delete item" });
  }
});
export default router;
