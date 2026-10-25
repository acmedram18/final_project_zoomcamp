import React, { useEffect, useState } from 'react'

function App() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch('/api/products/')
      .then(r => r.ok ? r.json() : [])
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Smart Pantry & Price Comparator</h1>
      <h2>Pantry Inventory</h2>
      <ul>
        {products.map(p => <li key={p.id}>{p.name} - {p.quantity} {p.unit || ''} (exp: {p.expiration_date || 'n/a'})</li>)}
      </ul>
    </div>
  )
}

export default App
