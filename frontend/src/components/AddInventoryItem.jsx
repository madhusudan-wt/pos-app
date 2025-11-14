import React, { useState, useRef } from "react";
import { Trash, Trash2, Plus } from "lucide-react";

const AddInventoryItem = () => {
  const [formData, setFormData] = useState({
    title: "",
    sku: "",
    description: "",
    category: "",
    price: "",
    salePrice: "",
    stockQuantity: "",
    status: "active",
    images: [],
    variants: [{ name: "", values: [{ value: "", price: "" }] }],
    generatedVariants: [],
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 🌩️ Cloudinary Config
  const CLOUD_NAME = "dtcgzwzvb";
  const UPLOAD_PRESET = "react_unsigned_upload";

  // 🌩️ Upload images
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", UPLOAD_PRESET);
          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            { method: "POST", body: data }
          );
          const json = await res.json();
          return json.secure_url;
        })
      );
      setFormData((p) => ({ ...p, images: [...p.images, ...urls] }));
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  // 🧩 Basic field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // 🧩 Variant name change
  const handleVariantChange = (index, e) => {
    const updated = [...formData.variants];
    updated[index].name = e.target.value;
    setFormData((p) => ({ ...p, variants: updated }));
  };

  // 🧩 Variant value change (name or price)
  const handleVariantValueChange = (variantIdx, valueIdx, field, value) => {
    const updated = [...formData.variants];
    updated[variantIdx].values[valueIdx][field] = value;

    // Add new empty row automatically
    if (
      field === "value" &&
      valueIdx === updated[variantIdx].values.length - 1 &&
      value.trim() !== ""
    ) {
      updated[variantIdx].values.push({ value: "", price: "" });
    }

    setFormData((p) => ({ ...p, variants: updated }));
  };

  // 🗑 Remove variant value
  const removeVariantValue = (variantIdx, valueIdx) => {
    const updated = [...formData.variants];
    updated[variantIdx].values.splice(valueIdx, 1);
    if (updated[variantIdx].values.length === 0)
      updated[variantIdx].values.push({ value: "", price: "" });
    setFormData((p) => ({ ...p, variants: updated }));
  };

  // ➕ Add/remove variant options
  const addVariantInput = () =>
    setFormData((p) => ({
      ...p,
      variants: [...p.variants, { name: "", values: [{ value: "", price: "" }] }],
    }));

  const removeVariantInput = (index) => {
    const updated = [...formData.variants];
    updated.splice(index, 1);
    setFormData((p) => ({ ...p, variants: updated }));
  };

  // 🧮 Generate combinations
  const generateCombinations = () => {
    const cleanedVariants = formData.variants
      .map((v) => ({
        name: v.name.trim(),
        values: v.values.filter((val) => val.value.trim() !== ""),
      }))
      .filter((v) => v.name && v.values.length > 0);

    if (cleanedVariants.length === 0) {
      alert("Please add at least one variant with values.");
      return;
    }

    const combine = (variants, prefix = {}) => {
      if (variants.length === 0) return [prefix];
      const [first, ...rest] = variants;
      const results = [];
      first.values.forEach((val) => {
        results.push(...combine(rest, { ...prefix, [first.name]: val }));
      });
      return results;
    };

    const combinations = combine(cleanedVariants).map((combo) => {
      // Auto-calc variant price addition (optional)
      const extraPrice = Object.values(combo).reduce(
        (sum, v) => sum + (Number(v.price) || 0),
        0
      );
      return {
        options: Object.fromEntries(
          Object.entries(combo).map(([k, v]) => [k, v.value])
        ),
        extraPrice,
        price: "", // user can override
        stock: "",
        sku: "",
      };
    });

    setFormData((p) => ({
      ...p,
      variants: cleanedVariants,
      generatedVariants: combinations,
    }));
  };

  // 🧩 Update variant field (SKU, price, stock)
  const handleVariantFieldChange = (index, field, value) => {
    const updated = [...formData.generatedVariants];
    updated[index][field] = value;
    setFormData((p) => ({ ...p, generatedVariants: updated }));
  };

  // 🧾 Submit
// 🧾 Submit — Save product to backend
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = {
    ...formData,
    variantCombination: formData.generatedVariants.map((v) => ({
      ...v,
      price: Number(v.price) || 0,
      stock: Number(v.stock) || 0,
    })),
  };

  try {
    const response = await fetch("http://localhost:5000/api/inventory/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("✅ Product saved successfully!");
      setFormData({
        title: "",
        sku: "",
        description: "",
        category: "",
        price: "",
        salePrice: "",
        stockQuantity: "",
        status: "active",
        images: [],
        variants: [{ name: "", values: [{ value: "", price: "" }] }],
        generatedVariants: [],
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      alert("❌ Failed to save product");
    }
  } catch (error) {
    console.error("Error saving product:", error);
    alert("⚠️ Error saving product. Check console for details.");
  }
};


  // 💅 Styles
  const inputStyle = {
    width: "100%",
    padding: "8px",
    margin: "5px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
  };
  const containerStyle = {
    maxWidth: "750px",
    margin: "20px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center" }}>Add Inventory Item</h2>
      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <input style={inputStyle} name="title" placeholder="Title" value={formData.title} onChange={handleChange} />
        <input style={inputStyle} name="sku" placeholder="SKU" value={formData.sku} onChange={handleChange} />
        <input style={inputStyle} name="category" placeholder="Category" value={formData.category} onChange={handleChange} />
        <input style={inputStyle} type="number" name="price" placeholder="Base Price" value={formData.price} onChange={handleChange} />
        {/* 🖼️ Image Upload */}
        <h3>Product Images</h3>
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ marginBottom: "10px" }}
        />
        {uploading && <p>Uploading images...</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {formData.images.map((url, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                width: "100px",
                height: "100px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <img
                src={url}
                alt={`upload-${idx}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  background: "rgba(255,0,0,0.7)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        {/* Variants */}
        <h3>Variants</h3>
        {formData.variants.map((variant, idx) => (
          <div key={idx} style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "5px", marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Option name (e.g. Size, Color)"
              value={variant.name}
              onChange={(e) => handleVariantChange(idx, e)}
              style={inputStyle}
            />

            {variant.values.map((val, valIdx) => (
              <div key={valIdx} style={{ display: "flex", gap: "5px", alignItems: "center", marginBottom: "5px" }}>
                <input
                  type="text"
                  placeholder={`Value ${valIdx + 1}`}
                  value={val.value}
                  onChange={(e) =>
                    handleVariantValueChange(idx, valIdx, "value", e.target.value)
                  }
                  style={{ flex: 1, padding: "8px" }}
                />
                <input
                  type="number"
                  placeholder="Extra Price"
                  value={val.price}
                  onChange={(e) =>
                    handleVariantValueChange(idx, valIdx, "price", e.target.value)
                  }
                  style={{ width: "120px", padding: "8px" }}
                />
                <button
                  type="button"
                  onClick={() => removeVariantValue(idx, valIdx)}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <Trash size={18} color="red" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => removeVariantInput(idx)}
              style={{ background: "none", border: "none", color: "red", cursor: "pointer" }}
            >
              <Trash2 size={18} /> Remove Option
            </button>
          </div>
        ))}

        <button type="button" onClick={addVariantInput} style={{ backgroundColor: "#2196F3", color: "#fff", padding: "8px 15px", borderRadius: "5px" }}>
          <Plus size={14} /> Add Option
        </button>

        <button type="button" onClick={generateCombinations} style={{ marginLeft: "10px", backgroundColor: "#FF9800", color: "#fff", padding: "8px 15px", borderRadius: "5px" }}>
          Generate Variants
        </button>

        {/* Generated Variants */}
        {formData.generatedVariants.length > 0 && (
          <div style={{ marginTop: "15px" }}>
            <h4>Generated Variants:</h4>
            {formData.generatedVariants.map((variant, i) => (
              <div key={i} style={{ background: "#f9f9f9", padding: "10px", borderRadius: "5px", marginBottom: "10px" }}>
                <div>
                  {Object.entries(variant.options)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" / ")}{" "}
                  {variant.extraPrice ? (
                    <span style={{ color: "green" }}>
                      (+₹{variant.extraPrice})
                    </span>
                  ) : null}
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                  <input
                    type="text"
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(e) =>
                      handleVariantFieldChange(i, "sku", e.target.value)
                    }
                    style={{ flex: 1, padding: "6px" }}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={variant.price}
                    onChange={(e) =>
                      handleVariantFieldChange(i, "price", e.target.value)
                    }
                    style={{ width: "100px", padding: "6px" }}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={variant.stock}
                    onChange={(e) =>
                      handleVariantFieldChange(i, "stock", e.target.value)
                    }
                    style={{ width: "100px", padding: "6px" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="submit" style={{ marginTop: "15px", padding: "10px 20px", borderRadius: "5px", backgroundColor: "#4CAF50", color: "#fff" }}>
          Save Product
        </button>
      </form>
    </div>
  );
};

export default AddInventoryItem;
