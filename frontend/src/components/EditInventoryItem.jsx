import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, Plus } from "lucide-react";

const EditInventoryItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
    variants: [{ name: "", values: [""] }],
    variantCombination: [], // new field for generated variant combos
  });

  // ✅ Load item from backend
  useEffect(() => {
    async function loadItem() {
      try {
        const res = await fetch(`http://localhost:5000/api/inventory/${id}`);
        const result = await res.json();
        const item = result.data;

        // normalize variants
        const normalizedVariants = (item.variants || [])
          .flatMap((v) => (Array.isArray(v) ? v : [v]))
          .map((v) => ({
            ...v,
            values: Array.isArray(v.values)
              ? v.values
              : typeof v.values === "string"
              ? v.values.split(",")
              : Object.values(v.values || {}),
          }));

        setFormData({
          ...item,
          variants:
            normalizedVariants.length > 0
              ? normalizedVariants
              : [{ name: "", values: [""] }],
          variantCombination: item.variantCombination || [],
        });
      } catch (err) {
        console.error(err);
      }
    }

    loadItem();
  }, [id]);

  // ✅ General input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Image upload (append new base64 images)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

    Promise.all(files.map(toBase64))
      .then((base64Images) => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...base64Images],
        }));
      })
      .catch((err) => console.error("Error converting to base64:", err));
  };

  // ✅ Remove image by index
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // ✅ Variant Handlers
  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...formData.variants];
    updated[index][name] = value;
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const handleVariantValueChange = (variantIdx, valueIdx, value) => {
    const updated = [...formData.variants];
    updated[variantIdx].values[valueIdx] = value;

    // auto add new empty input if last value is filled
    if (
      valueIdx === updated[variantIdx].values.length - 1 &&
      value.trim() !== ""
    ) {
      updated[variantIdx].values.push("");
    }

    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const removeVariantValue = (variantIdx, valueIdx) => {
    const updated = [...formData.variants];
    updated[variantIdx].values.splice(valueIdx, 1);
    if (updated[variantIdx].values.length === 0)
      updated[variantIdx].values.push("");
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const addVariantInput = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: "", values: [""] }],
    }));
  };

  const removeVariantInput = (index) => {
    const updated = [...formData.variants];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  // ✅ Variant Combination Handlers
  const handleComboChange = (idx, field, value) => {
    const updated = [...formData.variantCombination];
    updated[idx][field] = value;
    setFormData({ ...formData, variantCombination: updated });
  };

  const removeCombination = (idx) => {
    const updated = formData.variantCombination.filter((_, i) => i !== idx);
    setFormData({ ...formData, variantCombination: updated });
  };

  // ✅ Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const processedImages = formData.images.map((img) => {
      if (typeof img === "string" && img.startsWith("data:image")) {
        return img;
      }
      return img;
    });

    const payload = {
      ...formData,
      images: processedImages,
      variantCombination: formData.variantCombination,
    };

    try {
      const res = await fetch(
        `http://localhost:5000/api/inventory/update/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (res.ok) {
        alert("Item updated successfully!");
        navigate("/inventory");
      } else {
        alert(result.error || "Failed to update");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update item");
    }
  };

  // ✅ Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/inventory/delete/${id}`,
        { method: "DELETE" }
      );
      const result = await res.json();

      if (res.ok) {
        alert("Item deleted successfully");
        navigate("/inventory");
      } else {
        alert(result.error || "Failed to delete item");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting item");
    }
  };
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
      <h2>Edit Inventory Item</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          required
          style={inputStyle}
        />
        <input
          type="text"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="SKU"
          required
          style={inputStyle}
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          style={inputStyle}
        />
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
          style={inputStyle}

        />
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          required
          style={inputStyle}
        />
        <input
          type="number"
          name="salePrice"
          value={formData.salePrice}
          onChange={handleChange}
          placeholder="Sale Price"
          style={inputStyle}
        />
        <input
          type="number"
          name="stockQuantity"
          value={formData.stockQuantity}
          onChange={handleChange}
          placeholder="Stock Quantity"
          style={inputStyle}
        />
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* ✅ Variants Section */}
        {/* <h3>Variants</h3>
        {formData.variants.map((variant, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
            }}
          >
            <input
              type="text"
              name="name"
              placeholder="Variant Name (e.g. Color)"
              value={variant.name}
              onChange={(e) => handleVariantChange(idx, e)}
            />
            <button
              type="button"
              onClick={() => removeVariantInput(idx)}
              style={{ marginLeft: "10px" }}
            >
              <Trash2 size={16} />
            </button>
            <div style={{ marginTop: "5px" }}>
              {variant.values.map((val, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Value (e.g. Red)"
                    value={val}
                    onChange={(e) =>
                      handleVariantValueChange(idx, i, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeVariantValue(idx, i)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button type="button" onClick={addVariantInput}>
          <Plus size={16} /> Add Variant
        </button> */}

        {/* ✅ Variant Combinations */}
        {formData.variantCombination.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h3>Variant Combinations</h3>
            {formData.variantCombination.map((combo, idx) => (
             
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span>{combo.combination}</span>
                <label htmlFor="{combo.sku}" ></label>
                <input
                  type="text"
                  placeholder="SKU"
                  value={combo.sku}
                  onChange={(e) =>
                    handleComboChange(idx, "sku", e.target.value)
                  }
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={combo.price}
                  onChange={(e) =>
                    handleComboChange(idx, "price", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={combo.stock}
                  onChange={(e) =>
                    handleComboChange(idx, "stock", e.target.value)
                  }
                  style={inputStyle}
                />
                <button type="button" onClick={() => removeCombination(idx)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Image Section */}
        <h3>Images</h3>
        {formData.images?.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              margin: "10px 0",
            }}
          >
            {formData.images.map((x, idx) => (
              <div key={idx} style={{ position: "relative" }}>
                <img
                  src={x}
                  alt={`Preview ${idx}`}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  style={{
                    position: "absolute",
                    top: "0px",
                    right: "0px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    width: "20px",
                    height: "20px",
                    padding: "3px",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <input type="file" multiple onChange={handleImageChange} />

        <div style={{ marginTop: "20px" }}>
          <button type="submit">Update Item</button>
          <button
            type="button"
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "5px 10px",
              border: "none",
              borderRadius: "5px",
              marginLeft: "10px",
            }}
            onClick={() => handleDelete(id)}
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditInventoryItem;
