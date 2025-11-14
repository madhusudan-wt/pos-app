import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ViewInventory = ({addToCart}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
 const navigate = useNavigate();
// useEffect(() => {
//   fetch("http://localhost:5000/api/inventory/allinventory")
//     .then(async (res) => {
//       const text = await res.json(); // get raw text
//     //   console.log("Response text:", text);
//       return JSON.parse(text); // try parsing manually
//     })
//     .then((data) => setItems(data))
//     .catch((err) => console.error("Error fetching inventory:", err));
// }, []);

// useEffect(()=>
// {
// async function loadProducts() {
//   const res=await fetch("http://localhost:5000/api/inventory/allinventory")
//   const data=await res.json()
//   setItems(data)
//   console.log(data,"inventoryData----")
//     }
//     loadProducts();
// },[])

useEffect(() => {
  async function loadProducts() {
    try {
      const res = await fetch("http://localhost:5000/api/inventory/allinventory"); // make sure this matches your backend
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false); // ✅ stop loading
    }
  }
  loadProducts();
}, []);


  if (loading) return <h3 style={{ textAlign: "center" }}>Loading inventory...</h3>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Inventory Items</h2>

      {items.length === 0 ? (
        <p style={{ textAlign: "center" }}>No items found</p>
      ) : (
        <div style={styles.grid}>
          {items.map((item) => (
            <div key={item._id} style={styles.card}>
              {/* Images */}
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0]} // showing only first image
                  alt={item.title}
                  style={styles.image}
                />
              ) : (
                <div style={styles.noImage}>No Image</div>
              )}

              {/* Item Info */}
              <div style={styles.content}>
                <h3 style={styles.title}>{item.title}</h3>
                <p><b>SKU:</b> {item.sku}</p>
                <p><b>Category:</b> {item.category || "N/A"}</p>
                <p><b>Price:</b> ₹{item.price}</p>
                <p><b>Sale Price:</b> ₹{item.salePrice || "N/A"}</p>
                <p><b>Stock:</b> {item.stockQuantity}</p>
                <p><b>Status:</b> {item.status}</p>
                 <button onClick={() => navigate(`/edit-inventory/${item._id}`)}>Edit</button>
                      {/* Add to Cart button */}
      <button
        style={{
          padding: "6px 10px",
          borderRadius: "5px",
          backgroundColor: "#2196F3",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          marginLeft:"15px"
        }}
        onClick={() => addToCart(item)}
      >
        Add to Cart
      </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 💅 Inline styles for quick styling
const styles = {
  container: {
    padding: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  heading: {
    textAlign: "center",
    marginBottom: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    background: "#fff",
    transition: "0.3s",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
  },
  noImage: {
    width: "100%",
    height: "200px",
    backgroundColor: "#f0f0f0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#777",
    fontSize: "14px",
  },
  content: {
    padding: "15px",
  },
  title: {
    fontSize: "18px",
    marginBottom: "10px",
  },
};

export default ViewInventory;
