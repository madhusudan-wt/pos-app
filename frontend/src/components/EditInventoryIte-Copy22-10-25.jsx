import React, {useEffect, useState}from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trash, Trash2, Plus } from "lucide-react";

const EditInventoryItem = () => {
    const {id} = useParams();
const navigate = useNavigate();
const [formData, setFormData]= useState({
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
});


useEffect(() => {
    // fetch current item data
    async function loadItem() {
      try {
        const res = await fetch(`http://localhost:5000/api/inventory/${id}`);
        const data = await res.json();
        // console.log(data)
        setFormData({...data.data,
          variants: data.data.variants?.length ? data.data.variants : [{ name: "", values: [""] }],
      });
        
      } catch (err) {
        console.error(err);
      }
    }
    loadItem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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
        images: [...prev.images, ...base64Images], // ✅ Append new images, keep old
      }));
    })
    .catch((err) => console.error("Error converting to base64:", err));
};

const removeImage = (index) => {
  setFormData((prev) => ({
    ...prev,
    images: prev.images.filter((_, i) => i !== index),
  }));
};
  // ✅ Variant handlers
  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...formData.variants];
    updated[index][name] = value;
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  const handleVariantValueChange = (variantIdx, valueIdx, value) => {
    const updated = [...formData.variants];
    updated[variantIdx].values[valueIdx] = value;

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
    if (updated[variantIdx].values.length === 0) updated[variantIdx].values.push("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/inventory/update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.ok) {
        alert("Item updated successfully!");
        navigate("/inventory"); // redirect back to list page
      } else {
        alert(result.error || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update item");
    }
  };
const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this item?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/inventory/delete/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();

    if (res.ok) {
      alert("Item deleted successfully");
      navigate("/inventory"); // redirect back to inventory list
    } else {
      alert(result.error || "Failed to delete item");
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("Error deleting item");
  }
};


  return (
    <div style={{ maxWidth: "500px", margin: "20px auto" }}>
      <h2>Edit Inventory Item</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        <input type="text" name="sku" value={formData.sku} onChange={handleChange} required />
        <input type="text" name="description" value={formData.description} onChange={handleChange} />
        <input type="text" name="category" value={formData.category} onChange={handleChange} />
        <input type="number" name="price" value={formData.price} onChange={handleChange} required />
        <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} />
        <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} />
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>


        {/* ✅ Variants Section */}
        <h3 style={{ marginTop: "20px" }}>Variants</h3>
        <div>
          {formData.variants.map((variant, idx) => (
            <div key={idx} style={{ marginBottom: "15px", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}>
              <input
                type="text"
                name="name"
                placeholder="Variant name (e.g. Size)"
                value={variant.name}
                onChange={(e) => handleVariantChange(idx, e)}
                style={{ width: "100%", marginBottom: "10px" }}
              />
              {variant.values.map((val, valIdx) => (
                <div key={valIdx} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                  <input
                    type="text"
                    placeholder={`Value ${valIdx + 1}`}
                    value={val}
                    onChange={(e) =>
                      handleVariantValueChange(idx, valIdx, e.target.value)
                    }
                    style={{ flex: 1, marginRight: "10px" }}
                  />
                  <button type="button" onClick={() => removeVariantValue(idx, valIdx)}>
                    <Trash size={16} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => removeVariantInput(idx)} style={{ color: "red" }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button type="button" onClick={addVariantInput} style={{ marginTop: "10px" }}>
            <Plus size={16} /> Add Variant
          </button>
        </div>
        {/* ✅ End Variants Section */}

{formData.images && formData.images.length > 0 && (
  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "10px 0" }}>
    {formData.images.map((x, idx) => (
      <div key={idx} style={{ position: "relative" }}>
        <img
          src={x}
          alt={`Preview ${idx}`}
          style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "5px" }}
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
            padding: "3px"
          }}
        >
          ×
        </button>
      </div>
    ))}
  </div>
)}


        <input type="file" multiple onChange={handleImageChange} />
        <button type="submit">Update Item</button>
<button
  type="button"
  style={{
    backgroundColor: "red",
    color: "white",
    padding: "5px 10px",
    border: "none",
    borderRadius: "5px",
    marginLeft: "10px"
  }}
  onClick={() => handleDelete(id)}
>
  Delete
</button>

      </form>
    </div>
  );
};

export default EditInventoryItem;