// UploadProducts.jsx
import React, { useState } from "react";

const UploadProducts = () => {
  // form state
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("active");
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [totalStock, setTotalStock] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // helper to convert file -> base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // handle file input
  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const b64s = await Promise.all(files.map((f) => fileToBase64(f)));
    setImages((prev) => [...prev, ...b64s]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // submit handler
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setMessage(null);

    // prepare payload
    const payload = {
      title, // keep title
      handle,
      description,
      status,
      price: price === "" ? null : Number(price),
      salePrice: salePrice === "" ? null : Number(salePrice),
      totalStock: totalStock === "" ? null : Number(totalStock),
      image: images, // array of base64 strings
    };

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      // console.log(data, "response");

      if (!res.ok) throw new Error(data?.message || "Failed to create product");
      setMessage("Product created successfully.");

      // reset form
      setImages([]);
      setStatus("active");
      setTitle("");
      setHandle("");
      setDescription("");
      setPrice("");
      setSalePrice("");
      setTotalStock("");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h2>Create Product</h2>

      <form onSubmit={handleSubmit}>
        {/* Images */}
        <div style={{ marginBottom: 12 }}>
          <label>
            Images (multiple):
            <input type="file" accept="image/*" multiple onChange={handleFilesChange} />
          </label>

          {images.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {images.map((src, idx) => (
                <div key={idx} style={{ position: "relative", width: 120, height: 90, border: "1px solid #ddd", borderRadius: 6, overflow: "hidden" }}>
                  <img src={src} alt={`preview-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button type="button" onClick={() => removeImage(idx)} style={{ position: "absolute", top: 4, right: 4, background: "#fff", border: "none", cursor: "pointer" }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div style={{ marginBottom: 12 }}>
          <label>
            Status:
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">active</option>
              <option value="draft">draft</option>
              <option value="archived">archived</option>
            </select>
          </label>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 12 }}>
          <label>
            Title*:
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product title" required />
          </label>
        </div>

        {/* Handle */}
        <div style={{ marginBottom: 12 }}>
          <label>
            Handle (slug):
            <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="product-handle" />
          </label>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 12 }}>
          <label>
            Description:
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </label>
        </div>

        {/* Price & Sale Price & Stock */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <label>
            Price:
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
          </label>
          <label>
            Sale Price:
            <input value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="0.00" />
          </label>
          <label>
            Total Stock:
            <input value={totalStock} onChange={(e) => setTotalStock(e.target.value)} placeholder="0" />
          </label>
        </div>

        <div style={{ marginTop: 16 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Product"}
          </button>
        </div>

        {message && <div style={{ marginTop: 12 }}>{message}</div>}
      </form>
    </section>
  );
};

export default UploadProducts;
