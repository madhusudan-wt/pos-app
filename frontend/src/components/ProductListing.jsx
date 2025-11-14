import React from "react";

function ProductListing({ products, addToCart }) {
  if (!products || products.length === 0) {
    return <h3>Loading products...</h3>;
  }

  return (
    <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  }}
>
  {products.map((product) => (
    <div
      key={product._id}
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "15px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "transform 0.2s",
      }}
    >
      <div
        style={{
          width: "150px",
          height: "150px",
          marginBottom: "10px",
          overflow: "hidden",
          borderRadius: "8px",
        }}
      >
        <img
          src={product.image[0]}
          alt={product.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s",
          }}
        />
      </div>

      <h4 style={{ textAlign: "center", marginBottom: "8px" }}>
        {product.title}
      </h4>
      <p style={{ marginBottom: "12px", fontWeight: "bold", color: "#555" }}>
        ₹{product.price}
      </p>

      <button
        onClick={() => addToCart(product)}
        style={{
          padding: "8px 15px",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#45a049")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#4CAF50")}
      >
        Add to Cart
      </button>
    </div>
  ))}
</div>

  );
}

export default ProductListing;
