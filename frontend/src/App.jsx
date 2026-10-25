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
    <div style={{ padding: '40px 24px', maxWidth: '1050px', margin: '0 auto', minHeight: '100vh' }}>
      
      {/* Brand Header with Glow */}
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          🇨🇴 Edición Colombia
        </div>
        <h1 style={{ margin: 0, fontSize: '2.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #f3f4f6 30%, #9ca3af 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
          FiambreApp
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#9ca3af', fontSize: '1.05rem', fontWeight: 400 }}>
          La alacena del ahorro • Gestión inteligente y precios en tiempo real
        </p>
      </header>

      {/* Expiry Alert Banner */}
      {expiryAlert && expiryAlert.alert && (
        <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.05))', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '16px 24px', borderRadius: '16px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.3rem' }}>🚨</span>
            <div>
              <strong style={{ display: 'block', color: '#f87171', marginBottom: '2px' }}>Alerta de Caducidad</strong>
              <span>¡{expiryAlert.count} producto(s) están por vencer en los próximos 3 días!</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', background: 'rgba(239, 68, 68, 0.2)', padding: '6px 10px', borderRadius: '8px', color: '#fca5a5' }}>
            Trace ID: {expiryAlert.trace_id}
          </span>
        </div>
      )}

      {/* Glassmorphism Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(10px)', padding: '8px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
        <button onClick={() => setTab('inventory')} style={{ flex: 1, padding: '14px', background: tab === 'inventory' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent', color: '#fff', border: 'none', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: tab === 'inventory' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none' }}>📦 Inventario</button>
        <button onClick={() => setTab('shopping')} style={{ flex: 1, padding: '14px', background: tab === 'shopping' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent', color: '#fff', border: 'none', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: tab === 'shopping' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none' }}>🛒 Lista de Compras</button>
        <button onClick={() => setTab('prices')} style={{ flex: 1, padding: '14px', background: tab === 'prices' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent', color: '#fff', border: 'none', fontWeight: 600, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: tab === 'prices' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none' }}>🏷️ Comparador de Precios</button>
      </div>

      {/* MAIN GLASS CARD CONTAINER */}
      <div style={{ background: 'rgba(17, 24, 39, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '36px', boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)' }}>
        
        {/* TAB 1: INVENTORY */}
        {tab === 'inventory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Inventario de Despensa</h2>
            </div>
            
            <form onSubmit={saveProduct} style={{ background: 'rgba(31, 41, 55, 0.5)', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#60a5fa', fontWeight: 600 }}>{editingId ? 'Editar Producto' : 'Agregar Producto'}</h3>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px', fontWeight: 500 }}>Nombre *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Arroz Diana" required style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '10px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px', fontWeight: 500 }}>Categoría</label>
                <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej. Abarrotes" style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '10px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px', fontWeight: 500 }}>Cantidad *</label>
                <input type="number" step="0.1" value={quantity} onChange={e => setQuantity(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '10px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px', fontWeight: 500 }}>Unidad</label>
                <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Ej. kg, L, pzas" style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '10px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px', fontWeight: 500 }}>Fecha de Expiración</label>
                <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '10px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '8px', fontWeight: 500 }}>Stock Mínimo</label>
                <input type="number" step="0.1" value={minStock} onChange={e => setMinStock(e.target.value)} style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '10px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" style={{ padding: '12px 24px', background: editingId ? '#d97706' : '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
                  {editingId ? 'Actualizar Producto' : 'Agregar Producto'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setName(''); setCategory(''); setQuantity(1); setUnit(''); setExpirationDate(''); setMinStock(1); }} style={{ padding: '12px 24px', background: '#374151', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                )}
              </div>
            </form>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 500 }}>Filtrar por:</span>
              <button onClick={() => setFilter('all')} style={{ padding: '8px 16px', background: filter === 'all' ? '#2563eb' : '#1f2937', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>Todos</button>
              <button onClick={() => setFilter('expiring')} style={{ padding: '8px 16px', background: filter === 'expiring' ? '#2563eb' : '#1f2937', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>Por Caducar</button>
              <button onClick={() => setFilter('low_stock')} style={{ padding: '8px 16px', background: filter === 'low_stock' ? '#2563eb' : '#1f2937', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>Stock Bajo</button>
            </div>

            {products.length === 0 ? <p style={{ color: '#9ca3af', textAlign: 'center', padding: '60px 0', fontSize: '1.05rem' }}>No hay productos registrados en tu alacena.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600 }}>
                      <th style={{ padding: '14px 16px' }}>Nombre</th>
                      <th style={{ padding: '14px 16px' }}>Categoría</th>
                      <th style={{ padding: '14px 16px' }}>Cantidad</th>
                      <th style={{ padding: '14px 16px' }}>Expiración</th>
                      <th style={{ padding: '14px 16px' }}>Stock Mín.</th>
                      <th style={{ padding: '14px 16px', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', background: p.min_stock && p.quantity < p.min_stock ? 'rgba(239, 68, 68, 0.04)' : 'transparent', transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px', fontWeight: 600, color: '#f3f4f6' }}>
                          {p.name}
                          {p.min_stock && p.quantity < p.min_stock && <span style={{ marginLeft: '10px', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>Stock Bajo</span>}
                        </td>
                        <td style={{ padding: '16px', color: '#9ca3af' }}>{p.category || '—'}</td>
                        <td style={{ padding: '16px', color: '#e5e7eb' }}>{p.quantity} {p.unit || ''}</td>
                        <td style={{ padding: '16px', color: p.expiration_date ? '#e5e7eb' : '#6b7280' }}>{p.expiration_date || '—'}</td>
                        <td style={{ padding: '16px', color: '#9ca3af' }}>{p.min_stock}</td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <button onClick={() => startEdit(p)} style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '6px 12px', borderRadius: '8px', marginRight: '8px', cursor: 'pointer', fontWeight: 500 }}>Editar</button>
                          <button onClick={() => markOutOfStock(p.id)} style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '6px 12px', borderRadius: '8px', marginRight: '8px', cursor: 'pointer', fontWeight: 500 }}>Agotado</button>
                          <button onClick={() => deleteProduct(p.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Borrar</button>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Lista de Compras Inteligente</h2>
              <button onClick={generateShopping} style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)' }}>⚡ Auto-Generar por Stock</button>
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
            }} style={{ background: 'rgba(31, 41, 55, 0.5)', padding: '20px', borderRadius: '16px', marginBottom: '28px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', gap: '12px' }}>
              <input name="sname" placeholder="¿Qué necesitas comprar? (Ej. Leche Alpina)" required style={{ flex: 1, padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '10px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
              <input name="sqty" type="number" step="0.1" defaultValue="1" style={{ width: '100px', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '10px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
              <button type="submit" style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Agregar</button>
            </form>

            {shoppingList.length === 0 ? <p style={{ color: '#9ca3af', textAlign: 'center', padding: '60px 0', fontSize: '1.05rem' }}>Tu lista de compras está limpia.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600 }}>
                      <th style={{ padding: '14px 16px' }}>Artículo</th>
                      <th style={{ padding: '14px 16px' }}>Cantidad</th>
                      <th style={{ padding: '14px 16px' }}>Origen</th>
                      <th style={{ padding: '14px 16px' }}>Estado</th>
                      <th style={{ padding: '14px 16px', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shoppingList.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '16px', fontWeight: 550, color: '#f3f4f6' }}>{item.name}</td>
                        <td style={{ padding: '16px', color: '#e5e7eb' }}>{item.quantity_suggested}</td>
                        <td style={{ padding: '16px', color: '#9ca3af' }}>{item.source}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', background: item.status === 'pending' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(5, 150, 105, 0.1)', color: item.status === 'pending' ? '#fbbf24' : '#34d399', border: item.status === 'pending' ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(5, 150, 105, 0.2)' }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          {item.status === 'pending' && (
                            <button onClick={() => buyItem(item.id)} style={{ background: 'rgba(5, 150, 105, 0.1)', border: '1px solid rgba(5, 150, 105, 0.2)', color: '#34d399', padding: '6px 12px', borderRadius: '8px', marginRight: '8px', cursor: 'pointer', fontWeight: 500 }}>Comprar & Reabastecer</button>
                          )}
                          <button onClick={() => fetch(`${API_BASE}/shopping/${item.id}`, { method: 'DELETE' }).then(loadShopping)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Borrar</button>
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
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', fontWeight: 700, color: '#f9fafb' }}>Comparador de Precios (Colombia)</h2>
            
            <form onSubmit={searchPrices} style={{ marginBottom: '28px', display: 'flex', gap: '12px' }}>
              <input placeholder="¿Qué producto buscas? (ej. café juan valdez, leche alpina)" value={priceQuery} onChange={e => setPriceQuery(e.target.value)} required style={{ flex: 1, padding: '14px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '10px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
              <button type="submit" style={{ padding: '14px 28px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>Buscar</button>
            </form>

            {priceResults && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#9ca3af' }}>Resultados para "{priceResults.query}"</h3>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 8px', borderRadius: '6px', color: '#6b7280' }}>Trace ID: {priceResults.trace_id}</span>
                </div>

                {buyBetter && (
                  <div style={{ background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.15), rgba(4, 120, 87, 0.05))', border: '1px solid rgba(5, 150, 105, 0.3)', color: '#34d399', padding: '16px 20px', borderRadius: '14px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(5, 150, 105, 0.1)' }}>
                    <strong>💡 Recomendación "Comprar Mejor":</strong> {buyBetter.suggestion}
                  </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600 }}>
                        <th style={{ padding: '14px 16px' }}>Supermercado</th>
                        <th style={{ padding: '14px 16px' }}>Precio Aprox.</th>
                        <th style={{ padding: '14px 16px', textAlign: 'right' }}>Enlace</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceResults.results.map((res, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '16px', fontWeight: 550, color: '#f3f4f6' }}>{res.store}</td>
                          <td style={{ padding: '16px', color: '#34d399', fontWeight: 600 }}>${res.price.toLocaleString()} {res.currency}</td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <a href={res.url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}>Visitar Tienda →</a>
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
