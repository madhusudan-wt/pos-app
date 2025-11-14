// src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import "./index.css";
import ProductListing from "./components/ProductListing";
import Cart from "./components/Cart";
import Invoice from "./components/Invoice";
import { fetchProducts } from "./services/productService";
import useCart from "./hooks/useCart";
// import pos from "./assets/pos.png";
import posLogo from "./assets/pos.jpg";
import UploadProducts from "./components/UploadProducts";
import AddInventoryItem from "./components/AddInventoryItem";
import ViewInventory from "./components/ViewInventory";
import EditInventoryItem from "./components/EditInventoryItem";
export default function App() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const {
    cart,
    invoice,
    addToCart,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
    subtotal,
    taxCents,
    totalCents,
    formatCents,
    quickCheckout,
  } = useCart();

  useEffect(() => {
    async function loadProducts() {
      // console.log("hit--")
      const data = await fetchProducts();
      // console.log(data)
      setProducts(data);
    }
    loadProducts();
  }, []);

  return (
    <div className="app">
      <header>
        <a href="/inventory"><img src={posLogo} alt="POS Logo" style={{ width: "150px", marginRight: "10px" }} /></a>
        <nav style={{
          textAlign: "end",
          marginBottom: "30px",
          }}>
          <Link to="/inventory">Products</Link> |{" "}
          <Link to="/cart">Cart ({cart.length})</Link> {" "}
          <Link to="/addInventoryItem">Add Products</Link>
        </nav>
      </header>

      <main className="layout">
        <Routes>
          <Route
            path="/"
            element={<ViewInventory products={products}  addToCart={addToCart}/>}
          />
          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                formatCents={formatCents}
                decreaseQty={decreaseQty}
                increaseQty={increaseQty}
                subtotal={subtotal}
                TAX_RATE={0.12}
                taxCents={taxCents}
                totalCents={totalCents}
                clearCart={clearCart}
                quickCheckout={() => quickCheckout(navigate)}
                removeItem={removeItem}
              />
            }
          />
          <Route
            path="/invoice"
            element={<Invoice invoice={invoice} formatCents={formatCents} />}
          />
       
        
          <Route
            path="/uploadProduct"
            element={<UploadProducts/>}
          />
          <Route
            path="/addInventoryItem"
            element={<AddInventoryItem/>}
          />
          <Route
            path="/inventory"
            element={<ViewInventory products={products}  addToCart={addToCart}/>}
          />
          <Route path="/edit-inventory/:id" element={<EditInventoryItem />} />
        </Routes>
      </main>

      <footer>
        <small>Simple POS — tutorial version</small>
      </footer>
    </div>
  );
}
