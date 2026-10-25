import React, { useEffect, useState } from 'react'

function App() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [minStock, setMinStock] = useState(1)
  const [filter, setFilter] = useState('all')

  const loadProducts = () => {
    let url = '/api/products/'
    if (filter === 'expiring') url = '/api/products/expiring/soon?days=7'
    fetch(url)
      .then(r => r.ok ? r.json() : [])
      .then(setProducts)
      .catch(() => setProducts([]))
  }

  useEffect(() => {
    loadProducts()
  }, [filter])

  const addProduct = (e) => {
    e.preventDefault()
    fetch('/api/products/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        category: category || null,
        quantity: parseFloat(quantity),
        unit: unit || null,
        expiration_date: expirationDate || null,
        min_stock: parseFloat(minStock)
      })
    })
    .then(r => r.json())
    .then(() => {
      setName('')
      setCategory('')
      setQuantity(1)
      setUnit('')
      setExpirationDate('')
      setMinStock(1)
      loadProducts()
    })
  }

  const deleteProduct = (id) => {
    fetch(`/api/products/${id}`, { method: 'DELETE' })
      .then(() => loadProducts())
  }

  const markOutOfStock = (id) => {
    fetch(`/api/products/${id}/out_of_stock`, { method: 'POST' })
      .then(() => loadProducts())
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', maxWidth: 800, margin: '0 auto' }}>
      <h1>Smart Pantry & Price Comparator</h1>
      <h2>Pantry Inventory (CRUD & Filters)</h2>

      <form onSubmit={addProduct} style={{ background: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label>Name:*</label><br/>
          <input value={name} onChange={e => setName(e.target.value)} required style={{width: '100%'}} />
        </div>
        <div>
          <label>Category:</label><br/>
          <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Dairy, Produce" style={{width: '100%'}} />
        </div>
        <div>
          <label>Quantity:*</label><br/>
          <input type="number" step="0.1" value={quantity} onChange={e => setQuantity(e.target.value)} required style={{width: '100%'}} />
        </div>
        <div>
          <label>Unit:</label><br/>
          <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. L, pcs, kg" style={{width: '100%'}} />
        </div>
        <div>
          <label>Expiration Date:</label><br/>
          <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} style={{width: '100%'}} />
        </div>
        <div>
          <label>Min Stock:</label><br/>
          <input type="number" step="0.1" value={minStock} onChange={e => setMinStock(e.target.value)} style={{width: '100%'}} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <button type="submit" style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Add Product to Pantry</button>
        </div>
      </form>

      <div style={{ marginBottom: 15 }}>
        <strong>Filter: </strong>
        <button onClick={() => setFilter('all')} style={{ marginRight: 5, background: filter === 'all' ? '#007bff' : '#eee', color: filter === 'all' ? '#fff' : '#000', border: 'none', padding: '5px 10px', borderRadius: 4 }}>All Products</button>
        <button onClick={() => setFilter('expiring')} style={{ background: filter === 'expiring' ? '#007bff' : '#eee', color: filter === 'expiring' ? '#fff' : '#000', border: 'none', padding: '5px 10px', borderRadius: 4 }}>Expiring Soon (&lt;= 7 days)</button>
      </div>

      {products.length === 0 ? <p>No products found.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
          <thead>
            <tr style={{ background: '#eee', textAlign: 'left' }}>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Category</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Quantity</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Expiration</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Min Stock</th>
              <th style={{ padding: 8, border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.name}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.category || '-'}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.quantity} {p.unit || ''}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.expiration_date || '-'}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.min_stock}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>
                  <button onClick={() => markOutOfStock(p.id)} style={{ marginRight: 5, background: '#ffc107', border: 'none', padding: '4px 8px', borderRadius: 3, cursor: 'pointer' }}>Out of Stock</button>
                  <button onClick={() => deleteProduct(p.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 3, cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App
