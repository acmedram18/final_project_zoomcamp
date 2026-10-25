import React, { useEffect, useState } from 'react'

const API_BASE = 'http://localhost:8080'

function App() {
  const [tab, setTab] = useState('inventory')
  const [products, setProducts] = useState([])
  const [shoppingList, setShoppingList] = useState([])
  const [priceQuery, setPriceQuery] = useState('')
  const [priceResults, setPriceResults] = useState(null)
  const [buyBetter, setBuyBetter] = useState(null)
  const [expiryAlert, setExpiryAlert] = useState(null)

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

    fetch(`${API_BASE}/prices/buy_better`)
      .then(r => r.json())
      .then(setBuyBetter)
      .catch(() => setBuyBetter(null))
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Modern Header */}
      <header style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
          FiambreApp: La alacena del ahorro
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#9ca3af', fontSize: '0.95rem' }}>
          Gestión inteligente de despensa y comparación de precios en supermercados colombianos
        </p>
      </header>

      {/* Expiration Alert Banner */}
      {expiryAlert && expiryAlert.alert && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>⚠️ Alerta Crítica:</strong> ¡{expiryAlert.count} producto(s) están por caducar en los próximos 3 días!
          </div>
          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', background: 'rgba(239, 68, 68, 0.2)', padding: '4px 8px', borderRadius: '6px' }}>
            Trace ID: {expiryAlert.trace_id}
          </span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', background: '#111827', padding: '6px', borderRadius: '12px', border: '1px solid #1f2937' }}>
        <button onClick={() => setTab('inventory')} style={{ flex: 1, padding: '12px', background: tab === 'inventory' ? '#2563eb' : 'transparent', color: '#fff', border: 'none', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>Inventario</button>
        <button onClick={() => setTab('shopping')} style={{ flex: 1, padding: '12px', background: tab === 'shopping' ? '#2563eb' : 'transparent', color: '#fff', border: 'none', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>Lista de Compras</button>
        <button onClick={() => setTab('prices')} style={{ flex: 1, padding: '12px', background: tab === 'prices' ? '#2563eb' : 'transparent', color: '#fff', border: 'none', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>Comparador de Precios</button>
      </div>

      {/* MAIN CONTAINER CARD */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '28px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
        
        {/* TAB 1: INVENTORY */}
        {tab === 'inventory' && (
          <div>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: 700, color: '#f3f4f6' }}>Inventario de Despensa</h2>
            
            <form onSubmit={saveProduct} style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#60a5fa', fontWeight: 600 }}>{editingId ? 'Editar Producto' : 'Agregar Producto'}</h3>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Nombre *</label>
                <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Categoría</label>
                <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej. Lácteos" style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Cantidad *</label>
                <input type="number" step="0.1" value={quantity} onChange={e => setQuantity(e.target.value)} required style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Unidad</label>
                <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Ej. L, kg, pzas" style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Fecha de Expiración</label>
                <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Stock Mínimo</label>
                <input type="number" step="0.1" value={minStock} onChange={e => setMinStock(e.target.value)} style={{ width: '100%', padding: '10px', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button type="submit" style={{ padding: '10px 20px', background: editingId ? '#d97706' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  {editingId ? 'Actualizar' : 'Guardar Producto'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setName(''); setCategory(''); setQuantity(1); setUnit(''); setExpirationDate(''); setMinStock(1); }} style={{ padding: '10px 20px', background: '#374151', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                )}
              </div>
            </form>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Filtros:</span>
              <button onClick={() => setFilter('all')} style={{ padding: '6px 14px', background: filter === 'all' ? '#374151' : '#1f2937', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Todos</button>
              <button onClick={() => setFilter('expiring')} style={{ padding: '6px 14px', background: filter === 'expiring' ? '#374151' : '#1f2937', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Por Caducar</button>
              <button onClick={() => setFilter('low_stock')} style={{ padding: '6px 14px', background: filter === 'low_stock' ? '#374151' : '#1f2937', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>Stock Bajo</button>
            </div>

            {products.length === 0 ? <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>No hay productos en el inventario.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1f2937', color: '#9ca3af', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px' }}>Nombre</th>
                      <th style={{ padding: '12px' }}>Categoría</th>
                      <th style={{ padding: '12px' }}>Cantidad</th>
                      <th style={{ padding: '12px' }}>Expiración</th>
                      <th style={{ padding: '12px' }}>Stock Mín.</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #1f2937', background: p.min_stock && p.quantity < p.min_stock ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                        <td style={{ padding: '14px 12px', fontWeight: 550 }}>
                          {p.name}
                          {p.min_stock && p.quantity < p.min_stock && <span style={{ marginLeft: '8px', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '2px 6px', borderRadius: '4px' }}>Bajo</span>}
                        </td>
                        <td style={{ padding: '14px 12px', color: '#9ca3af' }}>{p.category || '—'}</td>
                        <td style={{ padding: '14px 12px' }}>{p.quantity} {p.unit || ''}</td>
                        <td style={{ padding: '14px 12px', color: p.expiration_date ? '#f3f4f6' : '#6b7280' }}>{p.expiration_date || '—'}</td>
                        <td style={{ padding: '14px 12px', color: '#9ca3af' }}>{p.min_stock}</td>
                        <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                          <button onClick={() => startEdit(p)} style={{ background: 'transparent', border: '1px solid #374151', color: '#60a5fa', padding: '4px 10px', borderRadius: '6px', marginRight: '6px', cursor: 'pointer' }}>Editar</button>
                          <button onClick={() => markOutOfStock(p.id)} style={{ background: 'transparent', border: '1px solid #374151', color: '#fbbf24', padding: '4px 10px', borderRadius: '6px', marginRight: '6px', cursor: 'pointer' }}>Agotado</button>
                          <button onClick={() => deleteProduct(p.id)} style={{ background: 'transparent', border: '1px solid #374151', color: '#f87171', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>Borrar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SHOPPING LIST */}
        {tab === 'shopping' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#f3f4f6' }}>Lista de Compras Inteligente</h2>
              <button onClick={generateShopping} style={{ padding: '10px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Auto-Generar por Stock</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              const name = e.target.sname.value
              const qty = parseFloat(e.target.sqty.value || 1)
              fetch(`${API_BASE}/shopping/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, quantity_to_buy: qty })
              }).then(() => { e.target.reset(); loadShopping(); })
            }} style={{ background: '#1f2937', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
              <input name="sname" placeholder="Artículo a comprar..." required style={{ flex: 1, padding: '10px', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              <input name="sqty" type="number" step="0.1" defaultValue="1" style={{ width: '90px', padding: '10px', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              <button type="submit" style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Agregar</button>
            </form>

            {shoppingList.length === 0 ? <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>La lista de compras está vacía.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1f2937', color: '#9ca3af', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px' }}>Artículo</th>
                      <th style={{ padding: '12px' }}>Cantidad</th>
                      <th style={{ padding: '12px' }}>Origen</th>
                      <th style={{ padding: '12px' }}>Estado</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shoppingList.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #1f2937' }}>
                        <td style={{ padding: '14px 12px', fontWeight: 550 }}>{item.name}</td>
                        <td style={{ padding: '14px 12px' }}>{item.quantity_suggested}</td>
                        <td style={{ padding: '14px 12px', color: '#9ca3af' }}>{item.source}</td>
                        <td style={{ padding: '14px 12px' }}>
                          <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: item.status === 'pending' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(5, 150, 105, 0.1)', color: item.status === 'pending' ? '#fbbf24' : '#34d399' }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                          {item.status === 'pending' && (
                            <button onClick={() => buyItem(item.id)} style={{ background: 'transparent', border: '1px solid #374151', color: '#34d399', padding: '4px 10px', borderRadius: '6px', marginRight: '6px', cursor: 'pointer' }}>Comprar & Reabastecer</button>
                          )}
                          <button onClick={() => fetch(`${API_BASE}/shopping/${item.id}`, { method: 'DELETE' }).then(loadShopping)} style={{ background: 'transparent', border: '1px solid #374151', color: '#f87171', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>Borrar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRICE COMPARATOR */}
        {tab === 'prices' && (
          <div>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: 700, color: '#f3f4f6' }}>Comparador de Precios (Colombia)</h2>
            
            <form onSubmit={searchPrices} style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
              <input placeholder="¿Qué producto buscas? (ej. leche deslactosada alpina, cafe)" value={priceQuery} onChange={e => setPriceQuery(e.target.value)} required style={{ flex: 1, padding: '12px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              <button type="submit" style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Buscar</button>
            </form>

            {priceResults && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#9ca3af' }}>Resultados para "{priceResults.query}"</h3>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#6b7280' }}>Trace ID: {priceResults.trace_id}</span>
                </div>

                {buyBetter && (
                  <div style={{ background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.3)', color: '#34d399', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px' }}>
                    <strong>💡 Recomendación "Comprar Mejor":</strong> {buyBetter.suggestion}
                  </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1f2937', color: '#9ca3af', fontSize: '0.85rem' }}>
                        <th style={{ padding: '12px' }}>Supermercado</th>
                        <th style={{ padding: '12px' }}>Precio</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Enlace</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceResults.results.map((res, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                          <td style={{ padding: '14px 12px', fontWeight: 550 }}>{res.store}</td>
                          <td style={{ padding: '14px 12px', color: '#34d399', fontWeight: 600 }}>${res.price.toLocaleString()} {res.currency}</td>
                          <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                            <a href={res.url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none' }}>Visitar Tienda →</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default App
