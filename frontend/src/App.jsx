import React, { useEffect, useState } from 'react'

function App() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('')

  const loadProducts = () => {
    fetch('/api/products/')
      .then(r => r.ok ? r.json() : [])
      .then(setProducts)
      .catch(err => {
        console.error(err)
        setProducts([])
      })
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const addProduct = (e) => {
    e.preventDefault()
    fetch('/api/products/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, quantity: parseFloat(quantity), unit })
    })
    .then(r => r.json())
    .then(() => {
      setName('')
      setQuantity(1)
      setUnit('')
      loadProducts()
    })
  }

  const deleteProduct = (id) => {
    fetch(`/api/products/${id}`, { method: 'DELETE' })
      .then(() => loadProducts())
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', maxWidth: 600, margin: '0 auto' }}>
      <h1>Smart Pantry & Price Comparator</h1>
      <h2>Pantry Inventory</h2>
      
      <form onSubmit={addProduct} style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <input placeholder="Product name" value={name} onChange={e => setName(e.target.value)} required />
        <input type="number" placeholder="Qty" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ width: 60 }} required />
        <input placeholder="Unit (e.g. kg, pcs)" value={unit} onChange={e => setUnit(e.target.value)} style={{ width: 100 }} />
        <button type="submit">Add Product</button>
      </form>

      {products.length === 0 ? <p>No products yet.</p> : (
        <ul style={{ paddingLeft: 20 }}>
          {products.map(p => (
            <li key={p.id} style={{ marginBottom: 8 }}>
              <b>{p.name}</b> - {p.quantity} {p.unit || ''} (Status: {p.status}) 
              <button onClick={() => deleteProduct(p.id)} style={{ marginLeft: 10, color: 'red' }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
