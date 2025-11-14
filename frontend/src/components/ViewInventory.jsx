import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ViewInventory = ({ addToCart }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [variantSelections, setVariantSelections] = useState({});
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(
          "http://localhost:5000/api/inventory/allinventory"
        );
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

  if (loading)
    return <h3 style={{ textAlign: "center" }}>Loading inventory...</h3>;

  // Convert variant values to uniform structure
  const getVariantValues = (variant) => {
    const vals = variant?.values;
    if (!vals) return [];

    if (Array.isArray(vals)) {
      return vals.map((v) => {
        if (typeof v === "string") return { label: v, value: v };
        if (typeof v === "object" && v !== null)
          return {
            label: v.value || v.name || v.label || JSON.stringify(v),
            value: v.value || v.name || v.label || v,
          };
        return { label: String(v), value: v };
      });
    }

    if (typeof vals === "string") {
      return vals.split(",").map((s) => ({ label: s.trim(), value: s.trim() }));
    }

    if (typeof vals === "object") {
      try {
        return Object.values(vals).map((v) => ({ label: v, value: v }));
      } catch {
        return [];
      }
    }

    return [];
  };

  const handleVariantChange = (variantName, value) => {
    setVariantSelections((prev) => ({ ...prev, [variantName]: value }));
  };

  const handleConfirmAdd = () => {
    if (!selectedItem) return;

    const normalizedVariants = Array.isArray(selectedItem.variants)
      ? selectedItem.variants.flat()
      : [];

    const selectedVariants = {};
    let allSelected = true;

    normalizedVariants.forEach((variantGroup) => {
      const name = variantGroup?.name || "Option";
      const selected = variantSelections[name];
      selectedVariants[name] = selected || null;
      if (!selected) allSelected = false;
    });

    if (normalizedVariants.length > 0 && !allSelected) {
      alert("⚠️ Please select all variant options before adding to cart.");
      return;
    }
     
    const variantLabel = Object.entries(selectedVariants)
       .filter(([_, val]) => val) 
       .map(([key, val]) => `${key}: ${val}`)
       .join(", ");

  const finalTitle = variantLabel ? `${selectedItem.title} (${variantLabel})`: selectedItem.title;

    const itemToAdd = {
      _id: selectedItem._id,
      title: finalTitle,
      price: selectedItem.price,
      sku: selectedItem.sku,
      image: selectedItem.images?.[0],
      selectedVariants,
      quantity,
    };

    addToCart(itemToAdd);

    setSelectedItem(null);
    setVariantSelections({});
    setQuantity(1);
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
              {item.images?.[0] ? (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  style={styles.image}
                />
              ) : (
                <div style={styles.noImage}>No Image</div>
              )}

              <div style={styles.content}>
                <h3 style={styles.title}>{item.title}</h3>
                <p>
                  <b>Price:</b> ₹{item.price}
                </p>
                <p>
                  <b>Category:</b> {item.category || "N/A"}
                </p>
                <p>
                  <b>Stock:</b> {item.stockQuantity}
                </p>

                <div
                  style={{ display: "flex", gap: "8px", marginTop: "8px" }}
                >
                  <button
                    onClick={() => navigate(`/edit-inventory/${item._id}`)}
                    style={styles.editBtn}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      // console.log("VARIANTS --->", item.variants);

                      const normalized = Array.isArray(item.variants)
                        ? item.variants.flat()
                        : [];

                      const resetSelections = {};
                      normalized.forEach((v) => {
                        const name = v?.name || "Option";
                        resetSelections[name] = "";
                      });

                      setVariantSelections(resetSelections);
                      setQuantity(1);
                      setSelectedItem(item);
                    }}
                    style={styles.addToCartButton}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedItem && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3 style={{ marginTop: 0 }}>{selectedItem.title}</h3>

            <div style={modalStyles.imageContainer}>
              {selectedItem.images?.length ? (
                selectedItem.images.map((img, i) => (
                  <img key={i} src={img} alt={`img-${i}`} style={modalStyles.image} />
                ))
              ) : (
                <div style={{ color: "#666" }}>No images</div>
              )}
            </div>

            <p><b>SKU:</b> {selectedItem.sku}</p>
            <p><b>Category:</b> {selectedItem.category}</p>
            <p><b>Price:</b> ₹{selectedItem.price}</p>
            <p><b>Stock:</b> {selectedItem.stockQuantity}</p>

            {/* VARIANTS (UPDATED CODE) */}
            {(() => {
              const normalizedVariants = Array.isArray(selectedItem.variants)
                ? selectedItem.variants.flat()
                : [];

              return (
                normalizedVariants.length > 0 && (
                  <div style={{ marginTop: "12px" }}>
                    <h4 style={{ marginBottom: "8px" }}>Available Variants:</h4>

                    {normalizedVariants.map((variant, idx) => {
                      const name = variant?.name || `Option ${idx + 1}`;
                      const values = getVariantValues(variant);

                      return (
                        <div key={idx} style={{ marginBottom: "12px" }}>
                          <div><b>{name}:</b></div>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "8px",
                              marginTop: "6px",
                            }}
                          >
                            {values.length === 0 ? (
                              <span style={{ color: "#999" }}>No options</span>
                            ) : (
                              values.map((val, i) => (
                                <button
                                  key={i}
                                  onClick={() =>
                                    handleVariantChange(name, val.value)
                                  }
                                  style={{
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    border:
                                      variantSelections[name] === val.value
                                        ? "2px solid #2196F3"
                                        : "1px solid #ccc",
                                    backgroundColor:
                                      variantSelections[name] === val.value
                                        ? "#E3F2FD"
                                        : "#fff",
                                    cursor: "pointer",
                                  }}
                                >
                                  {val.label}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              );
            })()}

            {/* QUANTITY */}
            <div style={{ marginTop: "10px" }}>
              <label><b>Quantity:</b></label>
              <input
                type="number"
                min={1}
                max={selectedItem.stockQuantity || 100}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{
                  marginLeft: "10px",
                  width: "60px",
                  padding: "6px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            {/* ACTIONS */}
            <div
              style={{
                marginTop: "15px",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleConfirmAdd}
                style={modalStyles.buttonConfirm}
              >
                Confirm Add
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                style={modalStyles.buttonCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: { padding: "30px", maxWidth: "1200px", margin: "0 auto" },
  heading: { textAlign: "center", marginBottom: "30px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    background: "#fff",
  },
  image: { width: "100%", height: "200px", objectFit: "cover" },
  noImage: {
    width: "100%",
    height: "200px",
    backgroundColor: "#f0f0f0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#777",
  },
  content: { padding: "15px" },
  title: { fontSize: "18px", marginBottom: "8px" },
  editBtn: {
    padding: "6px 10px",
    borderRadius: "5px",
    backgroundColor: "#777",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  addToCartButton: {
    padding: "6px 10px",
    borderRadius: "5px",
    backgroundColor: "#2196F3",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "450px",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  imageContainer: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "10px",
  },
  image: {
    width: "70px",
    height: "70px",
    objectFit: "cover",
    borderRadius: "5px",
  },
  buttonConfirm: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
  },
  buttonCancel: {
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
  },
};

export default ViewInventory;
