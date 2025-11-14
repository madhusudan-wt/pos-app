import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ViewInventory = ({ addToCart }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); // ✅ Item currently selected for modal
  const [variantSelections, setVariantSelections] = useState({}); // ✅ Track selected variant options
  const [quantity, setQuantity] = useState(1); // ✅ Track quantity in modal
  const navigate = useNavigate();

  // ✅ Fetch inventory items from backend
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("http://localhost:5000/api/inventory/allinventory");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (loading) return <h3 style={{ textAlign: "center" }}>Loading inventory...</h3>;

  // ✅ Confirm Add to Cart from modal (variant-only)
  const handleConfirmAdd = () => {
    if (!selectedItem) return;

    // Check if the product has variants
    if (selectedItem.variants && selectedItem.variants.length > 0) {
      // Ensure all variants are selected
      const selectedVariants = {};
      let allSelected = true;
      selectedItem.variants.flat().forEach((v) => {
        if (!variantSelections[v.name]) allSelected = false;
        selectedVariants[v.name] = variantSelections[v.name] || null;
      });

      if (!allSelected) {
        alert("Please select all variant options before adding to cart");
        return;
      }

      const itemToAdd = {
        _id: selectedItem._id,
        title: selectedItem.title,
        price: selectedItem.price,
        sku: selectedItem.sku,
        images: selectedItem.images[0],
        selectedVariants, // ✅ Only variant data
        quantity,
      };

      addToCart(itemToAdd); // ✅ Add only variant product to cart
    } else {
      alert("This product has no variants to add");
    }

    // ✅ Reset modal
    setSelectedItem(null);
    setVariantSelections({});
    setQuantity(1);
  };

  // ✅ Handle variant selection change
  const handleVariantChange = (variantName, value) => {
    setVariantSelections((prev) => ({ ...prev, [variantName]: value }));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Inventory Items</h2>
      {items.length === 0 ? (
        <p style={{ textAlign: "center" }}>No items found</p>
      ) : (
        <div style={styles.grid}>
          {items.map((item) => (
            <div key={item._id} style={styles.card}>
              {/* ✅ Safely render first image */}
              {item.images?.[0] ? (
                <img src={item.images[0]} alt={item.title} style={styles.image} />
              ) : (
                <div style={styles.noImage}>No Image</div>
              )}
              <div style={styles.content}>
                <h3 style={styles.title}>{item.title}</h3>
                <p><b>SKU:</b> {item.sku}</p>
                <p><b>Category:</b> {item.category || "N/A"}</p>
                <p><b>Price:</b> ₹{item.price}</p>
                <p><b>Sale Price:</b> ₹{item.salePrice || "N/A"}</p>
                <p><b>Stock:</b> {item.stockQuantity}</p>
                <p><b>Status:</b> {item.status}</p>

                <button onClick={() => navigate(`/edit-inventory/${item._id}`)}>Edit</button>

                {/* ✅ Open Modal on Add to Cart */}
                <button
                  style={styles.addToCartButton}
                  onClick={() => setSelectedItem(item)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Modal for Add to Cart */}
      {selectedItem && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3>{selectedItem.title}</h3>

            {/* ✅ Product Images */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {selectedItem.images?.map((img, i) => (
                <img
                  key={i}
                  src={img || "placeholder.jpg"}
                  alt={`img-${i}`}
                  style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "5px" }}
                />
              ))}
            </div>

            {/* ✅ Product Basic Info */}
            <p><b>SKU:</b> {selectedItem.sku}</p>
            <p><b>Category:</b> {selectedItem.category}</p>
            <p><b>Price:</b> ₹{selectedItem.price}</p>
            <p><b>Sale Price:</b> ₹{selectedItem.salePrice || "N/A"}</p>
            <p><b>Stock:</b> {selectedItem.stockQuantity}</p>
            <p><b>Status:</b> {selectedItem.status}</p>

            {/* ✅ Variants as Select Inputs */}
            {selectedItem.variants?.length > 0 && (
              <div>
                <h4>Select Variant:</h4>
                {selectedItem.variants.flat().map((v, idx) => (
                  <div key={idx} style={{ marginBottom: "10px" }}>
                    <label><b>{v.name}:</b></label>
                    <select
                      style={{ marginLeft: "10px" }}
                      value={variantSelections[v.name] || ""}
                      onChange={(e) => handleVariantChange(v.name, e.target.value)}
                    >
                      <option value="">Select {v.name}</option>
                      {v.values?.map((val, i) => (
                        <option key={i} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* ✅ Quantity Input */}
            <div style={{ marginTop: "10px" }}>
              <label><b>Quantity:</b></label>
              <input
                type="number"
                min={1}
                max={selectedItem.stockQuantity || 100}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{ marginLeft: "10px", width: "60px" }}
              />
            </div>

            {/* ✅ Modal Action Buttons */}
            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              <button onClick={handleConfirmAdd} style={modalStyles.buttonConfirm}>Confirm Add</button>
              <button onClick={() => setSelectedItem(null)} style={modalStyles.buttonCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 💅 Styles
const styles = {
  container: { padding: "30px", maxWidth: "1200px", margin: "0 auto" },
  heading: { textAlign: "center", marginBottom: "30px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" },
  card: { border: "1px solid #ddd", borderRadius: "10px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", background: "#fff" },
  image: { width: "100%", height: "200px", objectFit: "cover" },
  noImage: { width: "100%", height: "200px", backgroundColor: "#f0f0f0", display: "flex", justifyContent: "center", alignItems: "center", color: "#777" },
  content: { padding: "15px" },
  title: { fontSize: "18px", marginBottom: "10px" },
  addToCartButton: { padding: "6px 10px", borderRadius: "5px", backgroundColor: "#2196F3", color: "#fff", border: "none", cursor: "pointer", marginLeft: "15px" },
};

const modalStyles = {
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999 },
  modal: { backgroundColor: "#fff", padding: "20px", borderRadius: "8px", width: "400px", maxHeight: "80vh", overflowY: "auto" },
  buttonConfirm: { padding: "8px 12px", backgroundColor: "#4CAF50", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  buttonCancel: { padding: "8px 12px", backgroundColor: "#f44336", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
};

export default ViewInventory;
