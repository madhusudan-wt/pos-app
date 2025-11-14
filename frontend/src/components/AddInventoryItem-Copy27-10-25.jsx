import React, { useState, useRef  } from "react";
import {Trash,Trash2,Plus} from "lucide-react"
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
    variants: [{ name: "", values: [""] }],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

const [uploading, setUploading] = useState(false);
const fileInputRef = useRef(null); 




  // 🌩️ Cloudinary Integration Start
  const CLOUD_NAME = "dtcgzwzvb";
  const UPLOAD_PRESET = "react_unsigned_upload";

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        if (data.secure_url) {
          return data.secure_url; // ✅ Cloudinary URL
        } else {
          console.error("Upload failed:", data);
          return null;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url) => url !== null);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...validUrls],
      }));
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  // 🌩️ Cloudinary Integration End
  // Handle multiple image uploads and convert to Base64
// const handleImageChange = (e) => {
//   const files = Array.from(e.target.files);

//   const toBase64 = (file) =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result);
//       reader.onerror = (error) => reject(error);
//     });

//   Promise.all(files.map(toBase64))
//     .then((base64Images) => {
//       console.log("Base64 images ready:", base64Images);
//       setFormData((prev) => ({ ...prev, images: base64Images }));
//     })
//     .catch((err) => console.error("Error converting to base64:", err));
// };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      ...formData,
      price: Number(formData.price),
      salePrice: Number(formData.salePrice),
      stockQuantity: Number(formData.stockQuantity),
    };

    try {
      const response = await fetch("http://localhost:5000/api/inventory/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Item added successfully!");
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
        });

      }
       if (fileInputRef.current) {
    fileInputRef.current.value = ""; // ✅ Clear the file input
  }
       else {
        alert(result.error || "Failed to add item");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add item");
    }
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...formData.variants];
    updated[index][name] = value;
    setFormData((prev) => ({
      ...prev,
      variants: updated,
    }));
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
 
    setFormData((prev) => ({
      ...prev,
      variants: updated,
    }));
  };
 
  const removeVariantValue = (variantIdx, valueIdx) => {
    const updated = [...formData.variants];
    updated[variantIdx].values.splice(valueIdx, 1);
    if (updated[variantIdx].values.length === 0) {
      updated[variantIdx].values.push("");
    }
    setFormData((prev) => ({
      ...prev,
      variants: updated,
    }));
  };
 
  const addVariantInput = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: "", values: [""] }],
    }));
  };
 
  const addVariant = () => {
    const cleanedVariants = formData.variants
      .map((variant) => ({
        name: variant.name.trim(),
        values: variant.values.filter((v) => v.trim() !== ""),
      }))
      .filter((v) => v.name && v.values.length > 0);
 
    setFormData((prev) => ({
      ...prev,
      variants: cleanedVariants,
    }));
  };
 
  const removeVariantInput = (index) => {
    const updated = [...formData.variants];
    updated.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      variants: updated,
    }));
  };

  // Simple inline styles for spacing
  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "5px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
  };
  const containerStyle = {
    maxWidth: "500px",
    margin: "20px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };
  const buttonStyle = {
    padding: "10px 20px",
    marginTop: "10px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Add Inventory Item</h2>
      <form onSubmit={handleSubmit}>
        <div><input style={inputStyle} type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required /></div>
        <div><input style={inputStyle} type="text" name="sku" placeholder="SKU" value={formData.sku} onChange={handleChange} required /></div>
        <div><input style={inputStyle} type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} /></div>
        <div><input style={inputStyle} type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} /></div>
        <div><input style={inputStyle} type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required /></div>
        <div><input style={inputStyle} type="number" name="salePrice" placeholder="Sale Price" value={formData.salePrice} onChange={handleChange} /></div>
        <div><input style={inputStyle} type="number" name="stockQuantity" placeholder="Stock Quantity" value={formData.stockQuantity} onChange={handleChange} /></div>
        <div>
          <select style={inputStyle} name="status" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {/* 🌩️ Cloudinary Upload Input */}
        <div>
          <input
            style={inputStyle}
            type="file"
            name="images"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            ref={fileInputRef}
          />
        </div>

        {uploading && <p>Uploading images to Cloudinary...</p>}

        {/* Preview */}
        {formData.images.length > 0 && (
          <div style={{ marginTop: "10px" }}>
            <h4>Preview:</h4>
            <div
              style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
            >
              {formData.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="preview"
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                />
              ))}
            </div>
          </div>
        )}




<h2 className="font-semibold text-sm mb-2">Variants</h2>
            <div className="border p-1 rounded mb-4">
 
              {formData.variants?.map((variant, idx) => (
                <div key={idx} className="mb-4 bg-white p-4 rounded shadow-sm">
                  <input
                    type="text"
                    name="name"
                    placeholder="Option name (e.g. Size)"
                    value={variant.name}
                    onChange={(e) => handleVariantChange(idx, e)}
                    className="w-full border border-gray-300 p-2 rounded mb-2"
                  />
 
                  {variant.values?.map((val, valIdx) => (
                    <div key={valIdx} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        placeholder={`Value ${valIdx + 1}`}
                        value={val}
                        onChange={(e) =>
                          handleVariantValueChange(idx, valIdx, e.target.value)
                        }
                        className="flex-1 border border-gray-300 p-2 rounded"
                      />
                      {variant.values.length > 0 && (
                        <button
                          type="button"
                          onClick={() => removeVariantValue(idx, valIdx)}
                          className="hover:text-red-700"
                          title="Remove Value"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
 
                  <button
                    type="button"
                    onClick={() => removeVariantInput(idx)}
                    className="text-red-500 hover:text-red-700 mt-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
<div className="flex gap-1">
              <button
                type="button"
                onClick={addVariantInput}
                className="text-xs shadow-md flex bg-primary text-white rounded-md gap-2 w-30 h-8 items-center p-2"
              >
                <Plus size={"15px"}/>
              </button>
 
              <button
                type="button"
                onClick={addVariant}
                className="text-xs shadow-md flex bg-primary text-white rounded-md gap-2 w-30 h-8 items-center p-2"
              >
                Save
              </button>
              </div>
            </div>
        <button type="submit" style={buttonStyle}>Add Item</button>
      </form>
    </div>
  );
};

export default AddInventoryItem;