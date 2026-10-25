import React, { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:8080'

function App() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [minStock, setMinStock] = useState(1)
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)

  const loadProducts = () => {
    let url = `${API_BASE}/products/`
    if (filter === 'expiring') url = `${API_BASE}/products/expiring/soon?days=7`
    fetch(url)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (filter === 'low_stock') {
          setProducts(data.filter(p => p.min_stock && p.quantity < p.min_stock))
        } else {
          setProducts(data)
        }
      })
      .catch(() => setProducts([]))
  }

  useEffect(() => {
    loadProducts()
  }, [filter])

  const saveProduct = (e) => {
    e.preventDefault()
    const payload = {
      name,
      category: category || null,
      quantity: parseFloat(quantity),
      unit: unit || null,
      expiration_date: expirationDate || null,
      min_stock: parseFloat(minStock)
    }

    const url = editingId ? `${API_BASE}/products/${editingId}` : `${API_BASE}/products/`
    const method = editingId ? 'PUT' : 'POST'

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(() => {
      setName('')
      setCategory('')
      setQuantity(1)
      setUnit('')
      setExpirationDate('')
      setMinStock(1)
      setEditingId(null)
      loadProducts()
    })
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setName(p.name || '')
    setCategory(p.category || '')
    setQuantity(p.quantity || 1)
    setUnit(p.unit || '')
    setExpirationDate(p.expiration_date || '')
    setMinStock(p.min_stock || 1)
  }

  const deleteProduct = (id) => {
    fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' })
      .then(() => loadProducts())
  }

  const markOutOfStock = (id) => {
    fetch(`${API_BASE}/products/${id}/out_of_stock`, { method: 'POST' })
      .then(() => loadProducts())
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', maxWidth: 900, margin: '0 auto' }}>
      <h1>Smart Pantry & Price Comparator</h1>
      <h2>Pantry Inventory (CRUD & Filters)</h2>

      <form onSubmit={saveProduct} style={{ background: '#f9f9f9', padding: 15, borderRadius: 8, marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ gridColumn: 'span 2' }}>
          <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>
        </div>
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
        <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10 }}>
          <button type="submit" style={{ padding: '8px 16px', background: editingId ? '#ffc107' : '#28a745', color: editingId ? '#000' : 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {editingId ? 'Update Product' : 'Add Product to Pantry'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setName(''); setCategory(''); setQuantity(1); setUnit(''); setExpirationDate(''); setMinStock(1); }} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{ marginBottom: 15 }}>
        <strong>Filter: </strong>
        <button onClick={() => setFilter('all')} style={{ marginRight: 5, background: filter === 'all' ? '#007bff' : '#eee', color: filter === 'all' ? '#fff' : '#000', border: 'none', padding: '5px 10px', borderRadius: 4 }}>All Products</button>
        <button onClick={() => setFilter('expiring')} style={{ marginRight: 5, background: filter === 'expiring' ? '#007bff' : '#eee', color: filter === 'expiring' ? '#fff' : '#000', border: 'none', padding: '5px 10px', borderRadius: 4 }}>Expiring Soon (&lt;= 7 days)</button>
        <button onClick={() => setFilter('low_stock')} style={{ background: filter === 'low_stock' ? '#007bff' : '#eee', color: filter === 'low_stock' ? '#fff' : '#000', border: 'none', padding: '5px 10px', borderRadius: 4 }}>Low Stock</button>
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
              <tr key={p.id} style={{ background: p.min_stock && p.quantity < p.min_stock ? '#fff3cd' : 'transparent' }}>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.name} {p.min_stock && p.quantity < p.min_stock && <span style={{color: 'red', fontSize: 'small'}}>(Low Stock)</span>}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.category || '-'}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.quantity} {p.unit || ''}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.expiration_date || '-'}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>{p.min_stock}</td>
                <td style={{ padding: 8, border: '1px solid #ddd' }}>
                  <button onClick={() => startEdit(p)} style={{ marginRight: 5, background: '#17a2b8', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 3, cursor: 'pointer' }}>Edit</button>
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
