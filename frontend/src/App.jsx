import React, { useEffect, useState } from 'react'

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://fiambreapp-backend.onrender.com'

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
      .catch(() => setBuyBetter(10.5))
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Neobrutalist Header */}
      <header style={{ marginBottom: '36px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', background: '#facc15', color: '#0f172a', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px', border: '3px solid #0f172a', boxShadow: '3px 3px 0px #0f172a' }}>
          🇨🇴 Edición Colombia
        </div>
        <h1 style={{ margin: 0, fontSize: '3rem', fontWeight: 800, color: '#0f172a', textShadow: '4px 4px 0px #facc15', letterSpacing: '-1px' }}>
          FiambreApp
        </h1>
        <p style={{ margin: '10px 0 0 0', color: '#334155', fontSize: '1.1rem', fontWeight: 700 }}>
          La alacena del ahorro • Gestión inteligente y precios en tiempo real
        </p>
      </header>

      {/* Expiry Alert Banner */}
      {expiryAlert && expiryAlert.alert && (
        <div style={{ background: '#fef08a', border: '3px solid #0f172a', color: '#0f172a', padding: '16px 24px', borderRadius: '16px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '5px 5px 0px #0f172a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>🚨</span>
            <div>
              <strong style={{ display: 'block', fontWeight: 800 }}>¡Alerta de Caducidad!</strong>
              <span>{expiryAlert.count} producto(s) vencen en los próximos 3 días.</span>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', background: '#fff', border: '2px solid #0f172a', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
            ID: {expiryAlert.trace_id ? expiryAlert.trace_id.slice(0, 8) : 'demo'}
          </span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button onClick={() => setTab('inventory')} style={{ padding: '12px 20px', background: tab === 'inventory' ? '#facc15' : '#fff', color: '#0f172a', border: '3px solid #0f172a', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 0px #0f172a', textTransform: 'uppercase', fontSize: '0.85rem', flex: 1 }}>📦 Inventario</button>
        <button onClick={() => setTab('shopping')} style={{ padding: '12px 20px', background: tab === 'shopping' ? '#4ade80' : '#fff', color: '#0f172a', border: '3px solid #0f172a', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 0px #0f172a', textTransform: 'uppercase', fontSize: '0.85rem', flex: 1 }}>🛒 Lista de Compras</button>
        <button onClick={() => setTab('prices')} style={{ padding: '12px 20px', background: tab === 'prices' ? '#60a5fa' : '#fff', color: '#0f172a', border: '3px solid #0f172a', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 0px #0f172a', textTransform: 'uppercase', fontSize: '0.85rem', flex: 1 }}>🏷️ Comparador</button>
      </div>

      {/* MAIN CONTAINER */}
      <div style={{ background: '#fff', border: '3px solid #0f172a', borderRadius: '16px', padding: '28px', boxShadow: '6px 6px 0px #0f172a' }}>
        
        {/* TAB 1: INVENTORY */}
        {tab === 'inventory' && (
          <div>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Inventario de Despensa</h2>
            
            <form onSubmit={saveProduct} style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '3px solid #0f172a', boxShadow: '4px 4px 0px #0f172a', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>{editingId ? '✏️ Editar Producto' : '➕ Agregar Producto'}</h3>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a', marginBottom: '6px', fontWeight: 700 }}>Nombre *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Arroz Diana" required style={{ width: '100%', padding: '12px', background: '#fff', border: '3px solid #0f172a', borderRadius: '10px', color: '#0f172a', fontWeight: 600, fontSize: '0.95rem', outline: 'none', boxShadow: '3px 3px 0px #0f172a' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a', marginBottom: '6px', fontWeight: 700 }}>Categoría</label>
                <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej. Abarrotes" style={{ width: '100%', padding: '12px', background: '#fff', border: '3px solid #0f172a', borderRadius: '10px', color: '#0f172a', fontWeight: 600, fontSize: '0.95rem', outline: 'none', boxShadow: '3px 3px 0px #0f172a' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a', marginBottom: '6px', fontWeight: 700 }}>Cantidad *</label>
                <input type="number" step="0.1" value={quantity} onChange={e => setQuantity(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#fff', border: '3px solid #0f172a', borderRadius: '10px', color: '#0f172a', fontWeight: 600, fontSize: '0.95rem', outline: 'none', boxShadow: '3px 3px 0px #0f172a' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a', marginBottom: '6px', fontWeight: 700 }}>Unidad</label>
                <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Ej. kg, L, pzas" style={{ width: '100%', padding: '12px', background: '#fff', border: '3px solid #0f172a', borderRadius: '10px', color: '#0f172a', fontWeight: 600, fontSize: '0.95rem', outline: 'none', boxShadow: '3px 3px 0px #0f172a' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a', marginBottom: '6px', fontWeight: 700 }}>Fecha de Expiración</label>
                <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} style={{ width: '100%', padding: '12px', background: '#fff', border: '3px solid #0f172a', borderRadius: '10px', color: '#0f172a', fontWeight: 600, fontSize: '0.95rem', outline: 'none', boxShadow: '3px 3px 0px #0f172a' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a', marginBottom: '6px', fontWeight: 700 }}>Stock Mínimo</label>
                <input type="number" step="0.1" value={minStock} onChange={e => setMinStock(e.target.value)} style={{ width: '100%', padding: '12px', background: '#fff', border: '3px solid #0f172a', borderRadius: '10px', color: '#0f172a', fontWeight: 600, fontSize: '0.95rem', outline: 'none', boxShadow: '3px 3px 0px #0f172a' }} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button type="submit" style={{ padding: '12px 20px', background: editingId ? '#facc15' : '#4ade80', color: '#0f172a', border: '3px solid #0f172a', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 0px #0f172a', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                  {editingId ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setName(''); setCategory(''); setQuantity(1); setUnit(''); setExpirationDate(''); setMinStock(1); }} style={{ padding: '12px 20px', background: '#fff', color: '#0f172a', border: '3px solid #0f172a', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 0px #0f172a', textTransform: 'uppercase', fontSize: '0.85rem' }}>Cancelar</button>
                )}
              </div>
            </form>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 800 }}>FILTRAR:</span>
              <button onClick={() => setFilter('all')} style={{ padding: '12px 20px', background: filter === 'all' ? '#facc15' : '#fff', color: '#0f172a', border: '3px solid #0f172a', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 0px #0f172a', textTransform: 'uppercase', fontSize: '0.85rem' }}>Todos</button>
              <button onClick={() => setFilter('expiring')} style={{ padding: '12px 20px', background: filter === 'expiring' ? '#facc15' : '#fff', color: '#0f172a', border: '3px solid #0f172a', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 0px #0f172a', textTransform: 'uppercase', fontSize: '0.85rem' }}>Por Caducar</button>
              <button onClick={() => setFilter('low_stock')} style={{ padding: '12px 20px', background: filter === 'low_stock' ? '#facc15' : '#fff', color: '#0f172a', border: '3px solid #0f172a', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 0px #0f172a', textTransform: 'uppercase', fontSize: '0.85rem' }}>Stock Bajo</button>
            </div>

            {products.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0', fontWeight: 600 }}>No hay productos en tu alacena.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '3px solid #0f172a', boxShadow: '4px 4px 0px #0f172a' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '3px solid #0f172a', color: '#0f172a', fontSize: '0.9rem', fontWeight: 800 }}>
                      <th style={{ padding: '14px', borderRight: '2px solid #0f172a' }}>Nombre</th>
                      <th style={{ padding: '14px', borderRight: '2px solid #0f172a' }}>Categoría</th>
                      <th style={{ padding: '14px', borderRight: '2px solid #0f172a' }}>Cantidad</th>
                      <th style={{ padding: '14px', borderRight: '2px solid #0f172a' }}>Expiración</th>
                      <th style={{ padding: '14px', borderRight: '2px solid #0f172a' }}>Stock Mín.</th>
                      <th style={{ padding: '14px', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} style={{ borderBottom: '2px solid #0f172a', background: p.min_stock && p.quantity < p.min_stock ? '#fef08a' : '#fff' }}>
                        <td style={{ padding: '14px', fontWeight: 700, borderRight: '2px solid #0f172a', color: '#0f172a' }}>
                          {p.name}
                          {p.min_stock && p.quantity < p.min_stock && <span style={{ marginLeft: '8px', fontSize: '0.75rem', background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #0f172a', fontWeight: 800 }}>BAJO</span>}
                        </td>
                        <td style={{ padding: '14px', borderRight: '2px solid #0f172a', color: '#334155', fontWeight: 600 }}>{p.category || '—'}</td>
                        <td style={{ padding: '14px', borderRight: '2px solid #0f172a', fontWeight: 700 }}>{p.quantity} {p.unit || ''}</td>
                        <td style={{ padding: '14px', borderRight: '2px solid #0f172a', color: '#334155', fontWeight: 600 }}>{p.expiration_date || '—'}</td>
                        <td style={{ padding: '14px', borderRight: '2px solid #0f172a', color: '#334155', fontWeight: 600 }}>{p.min_stock}</td>
                        <td style={{ padding: '14px', textAlign: 'center' }}>
                          <button onClick={() => startEdit(p)} style={{ background: '#60a5fa', color: '#0f172a', border: '2px solid #0f172a', padding: '4px 10px', borderRadius: '6px', marginRight: '6px', cursor: 'pointer', fontWeight: 700, boxShadow: '2px 2px 0px #0f172a' }}>Editar</button>
                          <button onClick={() => markOutOfStock(p.id)} style={{ background: '#facc15', color: '#0f172a', border: '2px solid #0f172a', padding: '4px 10px', borderRadius: '6px', marginRight: '6px', cursor: 'pointer', fontWeight: 700, boxShadow: '2px 2px 0px #0f172a' }}>Agotado</button>
                          <button onClick={() => deleteProduct(p.id)} style={{ background: '#f87171', color: '#0f172a', border: '2px solid #0f172a', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, boxShadow: '2px 2px 0px #0f172a' }}>Borrar</button>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Lista de Compras</h2>
              <button onClick={generateShopping} style={{ padding: '12px 20px', background: '#4ade80', color: '#0f172a', border: '3px solid #0f172a', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 0px #0f172a', textTransform: 'uppercase', fontSize: '0.85rem' }}>⚡ Auto-Generar</button>
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
            }} style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '28px', border: '3px solid #0f172a', boxShadow: '4px 4px 0px #0f172a', display: 'flex', gap: '12px' }}>
              <input name="sname" placeholder="Artículo a comprar..." required style={{ width: '100%', padding: '12px', background: '#fff', border: '3px solid #0f172a', borderRadius: '10px', color: '#0f172a', fontWeight: 600, fontSize: '0.95rem', outline: 'none', boxShadow: '3px 3px 0px #0f172a' }} />
              <input name="sqty" type="number" step="0.1" defaultValue="1" style={{ width: '100px', padding: '12px', background: '#fff', border: '3px solid #0f172a', borderRadius: '10px', color: '#0f172a', fontWeight: 600, fontSize: '0.95rem', outline: 'none', boxShadow: '3px 3px 0px #0f172a' }} />
              <button type="submit" style={{ padding: '12px 20px', background: '#60a5fa', color: '#0f172a', border: '3px solid #0f172a', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 0px #0f172a', textTransform: 'uppercase', fontSize: '0.85rem' }}>Agregar</button>
            </form>

            {shoppingList.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0', fontWeight: 600 }}>Tu lista de compras está limpia.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '3px solid #0f172a', boxShadow: '4px 4px 0px #0f172a' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '3px solid #0f172a', color: '#0f172a', fontSize: '0.9rem', fontWeight: 800 }}>
                      <th style={{ padding: '14px', borderRight: '2px solid #0f172a' }}>Artículo</th>
                      <th style={{ padding: '14px', borderRight: '2px solid #0f172a' }}>Cantidad</th>
                      <th style={{ padding: '14px', borderRight: '2px solid #0f172a' }}>Origen</th>
                      <th style={{ padding: '14px', borderRight: '2px solid #0f172a' }}>Estado</th>
                      <th style={{ padding: '14px', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shoppingList.map(item => (
                      <tr key={item.id} style={{ borderBottom: '2px solid #0f172a', background: '#fff' }}>
                        <td style={{ padding: '14px', fontWeight: 700, borderRight: '2px solid #0f172a' }}>{item.name}</td>
                        <td style={{ padding: '14px', borderRight: '2px solid #0f172a', fontWeight: 600 }}>{item.quantity_suggested}</td>
                        <td style={{ padding: '14px', borderRight: '2px solid #0f172a', color: '#334155', fontWeight: 600 }}>{item.source}</td>
                        <td style={{ padding: '14px', borderRight: '2px solid #0f172a' }}>
                          <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', background: item.status === 'pending' ? '#fef08a' : '#4ade80', color: '#0f172a', border: '2px solid #0f172a', fontWeight: 800 }}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '14px', textAlign: 'center' }}>
                          {item.status === 'pending' && (
                            <button onClick={() => buyItem(item.id)} style={{ background: '#4ade80', color: '#0f172a', border: '2px solid #0f172a', padding: '4px 10px', borderRadius: '6px', marginRight: '6px', cursor: 'pointer', fontWeight: 700, boxShadow: '2px 2px 0px #0f172a' }}>Comprar</button>
                          )}
                          <button onClick={() => fetch(`${API_BASE}/shopping/${item.id}`, { method: 'DELETE' }).then(loadShopping)} style={{ background: '#f87171', color: '#0f172a', border: '2px solid #0f172a', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, boxShadow: '2px 2px 0px #0f172a' }}>Borrar</button>
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
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Comparador de Precios (Colombia)</h2>
            
            <form onSubmit={searchPrices} style={{ marginBottom: '28px', display: 'flex', gap: '12px' }}>
              <input placeholder="¿Qué producto buscas? (ej. café juan valdez, leche alpina)" value={priceQuery} onChange={e => setPriceQuery(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#fff', border: '3px solid #0f172a', borderRadius: '10px', color: '#0f172a', fontWeight: 600, fontSize: '0.95rem', outline: 'none', boxShadow: '3px 3px 0px #0f172a' }} />
              <button type="submit" style={{ padding: '12px 20px', background: '#60a5fa', color: '#0f172a', border: '3px solid #0f172a', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '4px 4px 0px #0f172a', textTransform: 'uppercase', fontSize: '0.85rem' }}>Buscar</button>
            </form>

            {priceResults && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#334155', fontWeight: 700 }}>Resultados para "{priceResults.query}"</h3>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', background: '#f1f5f9', border: '2px solid #0f172a', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>Trace ID: {priceResults.trace_id ? priceResults.trace_id.slice(0, 8) : 'demo'}</span>
                </div>

                {buyBetter && (
                  <div style={{ background: '#bbf7d0', border: '3px solid #0f172a', color: '#0f172a', padding: '16px 20px', borderRadius: '14px', marginBottom: '24px', boxShadow: '4px 4px 0px #0f172a', fontWeight: 700 }}>
                    <strong>💡 Recomendación "Comprar Mejor":</strong> {buyBetter.suggestion}
                  </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', border: '3px solid #0f172a', boxShadow: '4px 4px 0px #0f172a' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '3px solid #0f172a', color: '#0f172a', fontSize: '0.9rem', fontWeight: 800 }}>
                        <th style={{ padding: '14px', borderRight: '2px solid #0f172a' }}>Supermercado</th>
                        <th style={{ padding: '14px', borderRight: '2px solid #0f172a'}}]};
                      <th style={{ padding: '14px', borderRight: '2px solid #0f172a' }}>Precio Aprox.</th>
                      <th style={{ padding: '14px', textAlign: 'right' }}>Enlace</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceResults.results.map((res, idx) => (
                      <tr key={idx} style={{ borderBottom: '2px solid #0f172a', background: '#fff' }}>
                        <td style={{ padding: '14px', fontWeight: 700, borderRight: '2px solid #0f172a' }}>{res.store}</td>
                        <td style={{ padding: '14px', borderRight: '2px solid #0f172a', color: '#047857', fontWeight: 800 }}>${res.price.toLocaleString()} {res.currency}</td>
                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <a href={res.url} target="_blank" rel="noreferrer" style={{ background: '#facc15', color: '#0f172a', border: '2px solid #0f172a', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontWeight: 800, boxShadow: '2px 2px 0px #0f172a', display: 'inline-block' }}>Visitar ↗</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default App
