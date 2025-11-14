// src/services/productService.js

// Fetch all products from the backend API
export async function fetchProducts() {
  try {
    const res = await fetch("http://localhost:5000/api/products/getAll");
    const data = await res.json();
    // console.log(data,"data----")
    return data.data; // only return array of products
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function fetchProductsId(){
    try {
        const res=await fetch("http://localhost:5000/api/products/getProductId")
        const data=res.json()
        // console.log(data,"data---")
        return data
    } catch (error) {
        
    }
}
