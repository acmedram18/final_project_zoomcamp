import React, { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:8080'

function App() {
  const [tab, setTab] = useState('inventory')
  const [products, setProducts] = useState([])
  const [shoppingList, setShoppingList] = useState([])
  const [priceQuery, setPriceQuery] = useState('')
  const [priceResults, setPriceResults] = useState(null)

  // Form states
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

  const loadShopping = () => {
    fetch(`${API_BASE}/shopping/`)
      .then(r => r.ok ? r.json() : [])
      .then(setShoppingList)
      .catch(() => setShoppingList([]))
  }


  const [expiryAlert, setExpiryAlert] = useState(null)

  useEffect(() => {
    loadProducts()
    loadShopping()
    fetch(`${API_BASE}/products/alerts/expiring?days=3`)
      .then(r => r.json())
      .then(setExpiryAlert)
      .catch(() => setExpiryAlert(null))
  }, [filter, tab])


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
      setName(''); setCategory(''); setQuantity(1); setUnit(''); setExpirationDate(''); setMinStock(1); setEditingId(null)
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
    fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' }).then(() => loadProducts())
  }

  const markOutOfStock = (id) => {
    fetch(`${API_BASE}/products/${id}/out_of_stock`, { method: 'POST' }).then(() => { loadProducts(); loadShopping(); })
  }

  const generateShopping = () => {
    fetch(`${API_BASE}/shopping/generate`, { method: 'POST' }).then(() => loadShopping())
  }

  const buyItem = (id) => {
    fetch(`${API_BASE}/shopping/buy/${id}`, { method: 'POST' }).then(() => { loadShopping(); loadProducts(); })
  }

  const searchPrices = (e) => {
    e.preventDefault()
    fetch(`${API_BASE}/prices/search?q=${encodeURIComponent(priceQuery)}`)
      .then(r => r.json())
      .then(setPriceResults)
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', maxWidth: 950, margin: '0 auto' }}>
      
      <h1>Smart Pantry & Price Comparator</h1>
      
      {expiryAlert && expiryAlert.alert && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 15px', borderRadius: 5, marginBottom: 15, border: '1px solid #f5c6cb' }}>
          <strong>⚠️ High Severity Alert:</strong> {expiryAlert.count} product(s) expiring in the next 3 days! 
          <span style={{ fontSize: 'small', marginLeft: 10, fontFamily: 'monospace' }}>[Trace ID: {expiryAlert.trace_id}]</span>
        </div>
      )}

      
      <div style={{ marginBottom: 20, borderBottom: '2px solid #ddd', paddingBottom: 10 }}>
        <button onClick={() => setTab('inventory')} style={{ marginRight: 10, padding: '8px 16px', background: tab === 'inventory' ? '#007bff' : '#f8f9fa', color: tab === 'inventory' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}>Pantry Inventory</button>
        <button onClick={() => setTab('shopping')} style={{ marginRight: 10, padding: '8px 16px', background: tab === 'shopping' ? '#007bff' : '#f8f9fa', color: tab === 'shopping' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}>Smart Shopping List</button>
        <button onClick={() => setTab('prices')} style={{ padding: '8px 16px', background: tab === 'prices' ? '#007bff' : '#f8f9fa', color: tab === 'prices' ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}>Price Comparison & Buy Better</button>
      </div>

      {tab === 'inventory' && (
        <div>
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
      )}

      {tab === 'shopping' && (
        <div>
          <h2>Smart Shopping List</h2>
          <button onClick={generateShopping} style={{ marginBottom: 15, padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Auto-Generate from Low Stock</button>
          {shoppingList.length === 0 ? <p>Shopping list is empty.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
              <thead>
                <tr style={{ background: '#eee', textAlign: 'left' }}>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>Item Name</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>Suggested Qty</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>Source</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {shoppingList.map(item => (
                  <tr key={item.id}>
                    <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.name}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.quantity_suggested}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.source}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd' }}>{item.status}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd' }}>
                      {item.status === 'pending' && (
                        <button onClick={() => buyItem(item.id)} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 3, cursor: 'pointer' }}>Mark Bought & Restock</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'prices' && (
        <div>
          <h2>Price Comparison & "Buy Better"</h2>
          <form onSubmit={searchPrices} style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
            <input placeholder="Search product query (e.g. milk, eggs)" value={priceQuery} onChange={e => setPriceQuery(e.target.value)} required style={{ flex: 1, padding: 8 }} />
            <button type="submit" style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Search Prices</button>
          </form>

          {priceResults && (
            <div>
              <h3>Comparison Table for "{priceResults.query}" (Trace ID: {priceResults.trace_id})</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
                <thead>
                  <tr style={{ background: '#eee', textAlign: 'left' }}>
                    <th style={{ padding: 8, border: '1px solid #ddd' }}>Store</th>
                    <th style={{ padding: 8, border: '1px solid #ddd' }}>Price</th>
                    <th style={{ padding: 8, border: '1px solid #ddd' }}>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {priceResults.results.map((res, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: 8, border: '1px solid #ddd' }}>{res.store}</td>
                      <td style={{ padding: 8, border: '1px solid #ddd' }}>${res.price.toFixed(2)} {res.currency}</td>
                      <td style={{ padding: 8, border: '1px solid #ddd' }}><a href={res.url} target="_blank" rel="noreferrer">View Store</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App

// Alert component for expiration and traces
