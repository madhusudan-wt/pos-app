// src/hooks/useCart.js
import { useState } from "react";

export default function useCart(TAX_RATE = 0.12) {
  const [cart, setCart] = useState([]);
  const [invoice, setInvoice] = useState(null);

  // Add product to cart
  function addToCart(product) {
    setInvoice(null);
    // console.log(product,"prod add to cat---")
    setCart((prev) => {
      const existing = prev.find((p) => p._id === product._id);
      if (existing) {
        return prev.map((p) =>
          p._id === product._id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  // Increase/decrease qty
  function increaseQty(_id) {
    setCart((prev) =>
      prev.map((p) => (p._id === _id ? { ...p, qty: p.qty + 1 } : p))
    );
  }

  function decreaseQty(_id) {
    setCart((prev) =>
      prev
        .map((p) => (p._id === _id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0)
    );
  }

  // Remove item or clear cart
  function removeItem(_id) {
    setCart((prev) => prev.filter((p) => p._id !== _id));
  }

  function clearCart() {
    setCart([]);
  }

  // Calculate totals
  const subtotal = cart.reduce(
    (acc, item) => acc + Math.round(item.price * 100) * item.qty,
    0
  );
  const taxCents = Math.round(subtotal * TAX_RATE);
  const totalCents = subtotal + taxCents;

  function formatCents(cents) {
    return (cents / 100).toFixed(2);
  }

  // Checkout logic
  function checkout(cashReceived, navigate) {
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    const invoiceData = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      items: cart,
      subtotal,
      tax: taxCents,
      total: totalCents,
      cashReceived: Math.round(cashReceived * 100),
      change: Math.round(cashReceived * 100) - totalCents,
    };

    setInvoice(invoiceData);
    setCart([]);
    navigate("/invoice");
  }

  function quickCheckout(navigate) {
    const cashStr = prompt(
      `Total is ${formatCents(totalCents)}. Enter cash received:`,
      formatCents(totalCents)
    );
    if (cashStr === null) return;

    const cashNum = Number(cashStr);
    if (Number.isNaN(cashNum) || cashNum < totalCents / 100) {
      alert("Invalid or insufficient cash.");
      return;
    }

    checkout(cashNum, navigate);
  }

  return {
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
  };
}
