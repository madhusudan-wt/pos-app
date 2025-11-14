import React from 'react'

const Cart = ({cart,formatCents,decreaseQty,increaseQty,subtotal,TAX_RATE,taxCents,totalCents ,clearCart,quickCheckout,removeItem }) => {

  return (
     <section className="panel">
          <h2>Cart</h2>
          
          {cart.length === 0 ? (
            <div className="empty">Cart is empty</div>
          ) : (
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Line</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
  {cart.map((item) => (
    <tr key={item._id}>
      <td>{item.title}</td>
      <td>
        {/* <img src={item.images[0]} alt={item.title} width="50" height="50" /> */}
        {/* <img src={item.images ? item.images : "placeholder.jpg"} alt={item.title} width="50" height="50"/> */}
        <img src={item.image ? item.image : "placeholder.jpg"} alt={item.title} width="50" height="50"/>
      </td>
      <td>${item.price.toFixed(2)}</td>
      <td>
        <button onClick={() => decreaseQty(item._id)}>-</button>
        <span className="qty">{item.qty}</span>
        <button onClick={() => increaseQty(item._id)}>+</button>
      </td>
      <td>${((Math.round(item.price * 100) * item.qty) / 100).toFixed(2)}</td>
      <td>
        <button onClick={() => removeItem(item._id)}>Remove</button>
      </td>
    </tr>
  ))}
</tbody>

            </table>
          )}

          {/* totals and actions */}
          <div className="totals">
            <div>Subtotal: ${formatCents(subtotal)}</div>
            <div>Tax ({(TAX_RATE * 100).toFixed(0)}%): ${formatCents(taxCents)}</div>
            <div><strong>Total: ${formatCents(totalCents)}</strong></div>
          </div>

          <div className="cart-actions">
            <button onClick={clearCart}>Clear Cart</button>
            <button onClick={quickCheckout} disabled={cart.length === 0}>Checkout</button>
          </div>
        </section>
  )
}

export default Cart