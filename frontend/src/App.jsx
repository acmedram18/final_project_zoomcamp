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
    <div style={{ padding: '30px 40px', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', maxWidth: 950, margin: '0 auto', background: '#121212', color: '#e0e0e0', minHeight: '100vh' }}>
      
      {/* Bauhaus Minimalist Header */}
      <header style={{ borderBottom: '3px solid #ff3333', paddingBottom: 15, marginBottom: 25, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', letterSpacing: '1px', color: '#ffffff', textTransform: 'uppercase', fontWeight: 900 }}>Despensa Inteligente & Comparador</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#aaaaaa', textTransform: 'uppercase', letterSpacing: '2px' }}>Estilo Bauhaus • Modo Oscuro</p>
        </div>
      </header>

      {/* Alerta de Expiración */}
      {expiryAlert && expiryAlert.alert && (
        <div style={{ background: '#2c1515', color: '#ff6b6b', padding: '12px 18px', borderRadius: 0, marginBottom: 20, borderLeft: '5px solid #ff3333' }}>
          <strong>⚠️ Alerta de Caducidad:</strong> ¡{expiryAlert.count} producto(s) caducan en los próximos 3 días!
          <span style={{ fontSize: '11px', marginLeft: 15, fontFamily: 'monospace', color: '#888' }}>[Traza ID: {expiryAlert.trace_id}]</span>
        </div>
      )}

      {/* Pestañas Bauhaus */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: 30 }}>
        <button onClick={() => setTab('inventory')} style={{ padding: '10px 20px', background: tab === 'inventory' ? '#ff3333' : '#1e1e1e', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Inventario</button>
        <button onClick={() => setTab('shopping')} style={{ padding: '10px 20px', background: tab === 'shopping' ? '#ff3333' : '#1e1e1e', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Lista de Compras</button>
        <button onClick={() => setTab('prices')} style={{ padding: '10px 20px', background: tab === 'prices' ? '#ff3333' : '#1e1e1e', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Precios y Sugerencias</button>
      </div>

      {/* PESTAÑA: INVENTARIO */}
      {tab === 'inventory' && (
        <div>
          <h2 style={{ fontSize: '18px', textTransform: 'uppercase', borderBottom: '1px solid #333', paddingBottom: 8, letterSpacing: '1px' }}>Inventario de Despensa</h2>
          
          <form onSubmit={saveProduct} style={{ background: '#181818', padding: 20, borderRadius: 0, marginBottom: 25, border: '1px solid #333', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase', color: '#ff3333' }}>{editingId ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h3>
            </div>
            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888' }}>Nombre:*</label><br/>
              <input value={name} onChange={e => setName(e.target.value)} required style={{width: '100%', padding: '8px', background: '#222', border: '1px solid #444', color: '#fff'}} />
            </div>
            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888' }}>Categoría:</label><br/>
              <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej. Lácteos, Granos" style={{width: '100%', padding: '8px', background: '#222', border: '1px solid #444', color: '#fff'}} />
            </div>
            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888' }}>Cantidad:*</label><br/>
              <input type="number" step="0.1" value={quantity} onChange={e => setQuantity(e.target.value)} required style={{width: '100%', padding: '8px', background: '#222', border: '1px solid #444', color: '#fff'}} />
            </div>
            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888' }}>Unidad:</label><br/>
              <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Ej. L, pzas, kg" style={{width: '100%', padding: '8px', background: '#222', border: '1px solid #444', color: '#fff'}} />
            </div>
            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888' }}>Fecha de Expiración:</label><br/>
              <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} style={{width: '100%', padding: '8px', background: '#222', border: '1px solid #444', color: '#fff'}} />
            </div>
            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888' }}>Stock Mínimo:</label><br/>
              <input type="number" step="0.1" value={minStock} onChange={e => setMinStock(e.target.value)} style={{width: '100%', padding: '8px', background: '#222', border: '1px solid #444', color: '#fff'}} />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, marginTop: 5 }}>
              <button type="submit" style={{ padding: '10px 20px', background: editingId ? '#ffcc00' : '#ff3333', color: editingId ? '#000' : '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', fontSize: '11px' }}>
                {editingId ? 'Actualizar Producto' : 'Guardar Producto'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setName(''); setCategory(''); setQuantity(1); setUnit(''); setExpirationDate(''); setMinStock(1); }} style={{ padding: '10px 20px', background: '#444', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', fontSize: '11px' }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div style={{ marginBottom: 20 }}>
            <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#888', marginRight: 10 }}>Filtros:</strong>
            <button onClick={() => setFilter('all')} style={{ marginRight: 5, background: filter === 'all' ? '#ff3333' : '#1e1e1e', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer' }}>Todos</button>
            <button onClick={() => setFilter('expiring')} style={{ marginRight: 5, background: filter === 'expiring' ? '#ff3333' : '#1e1e1e', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer' }}>Por Caducar (&lt;= 7 días)</button>
            <button onClick={() => setFilter('low_stock')} style={{ background: filter === 'low_stock' ? '#ff3333' : '#1e1e1e', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer' }}>Stock Bajo</button>
          </div>

          {products.length === 0 ? <p style={{ color: '#777' }}>No hay productos registrados.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#1a1a1a', textAlign: 'left', borderBottom: '2px solid #333', color: '#aaa', textTransform: 'uppercase', fontSize: '11px' }}>
                  <th style={{ padding: 10 }}>Nombre</th>
                  <th style={{ padding: 10 }}>Categoría</th>
                  <th style={{ padding: 10 }}>Cantidad</th>
                  <th style={{ padding: 10 }}>Caducidad</th>
                  <th style={{ padding: 10 }}>Stock Mín.</th>
                  <th style={{ padding: 10 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #222', background: p.min_stock && p.quantity < p.min_stock ? '#2a1f1f' : 'transparent' }}>
                    <td style={{ padding: 10, fontWeight: 600 }}>{p.name} {p.min_stock && p.quantity < p.min_stock && <span style={{color: '#ff6b6b', fontSize: '10px', marginLeft: 6}}>(Stock Bajo)</span>}</td>
                    <td style={{ padding: 10, color: '#aaa' }}>{p.category || '-'}</td>
                    <td style={{ padding: 10 }}>{p.quantity} {p.unit || ''}</td>
                    <td style={{ padding: 10, color: p.expiration_date ? '#ddd' : '#666' }}>{p.expiration_date || '-'}</td>
                    <td style={{ padding: 10, color: '#aaa' }}>{p.min_stock}</td>
                    <td style={{ padding: 10 }}>
                      <button onClick={() => startEdit(p)} style={{ marginRight: 5, background: '#333', color: '#fff', border: 'none', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => markOutOfStock(p.id)} style={{ marginRight: 5, background: '#b28704', color: '#fff', border: 'none', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' }}>Agotado</button>
                      <button onClick={() => deleteProduct(p.id)} style={{ background: '#8b0000', color: '#fff', border: 'none', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' }}>Borrar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* PESTAÑA: LISTA DE COMPRAS */}
      {tab === 'shopping' && (
        <div>
          <h2 style={{ fontSize: '18px', textTransform: 'uppercase', borderBottom: '1px solid #333', paddingBottom: 8, letterSpacing: '1px' }}>Lista de Compras Inteligente</h2>
          
          <form onSubmit={(e) => {
            e.preventDefault()
            const name = e.target.sname.value
            const qty = parseFloat(e.target.sqty.value || 1)
            fetch(`${API_BASE}/shopping/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, quantity_to_buy: qty })
            }).then(() => { e.target.reset(); loadShopping(); })
          }} style={{ background: '#181818', padding: 15, borderRadius: 0, marginBottom: 20, border: '1px solid #333', display: 'flex', gap: 10 }}>
            <input name="sname" placeholder="Nombre del artículo" required style={{ flex: 1, padding: '8px', background: '#222', border: '1px solid #444', color: '#fff' }} />
            <input name="sqty" type="number" step="0.1" defaultValue="1" style={{ width: 80, padding: '8px', background: '#222', border: '1px solid #444', color: '#fff' }} />
            <button type="submit" style={{ padding: '8px 16px', background: '#ff3333', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', fontSize: '11px' }}>Agregar</button>
          </form>

          <button onClick={generateShopping} style={{ marginBottom: 20, padding: '10px 20px', background: '#1e1e1e', color: '#fff', border: '1px solid #444', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', fontSize: '11px' }}>Auto-Generar por Stock Bajo</button>

          {shoppingList.length === 0 ? <p style={{ color: '#777' }}>La lista de compras está vacía.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#1a1a1a', textAlign: 'left', borderBottom: '2px solid #333', color: '#aaa', textTransform: 'uppercase', fontSize: '11px' }}>
                  <th style={{ padding: 10 }}>Artículo</th>
                  <th style={{ padding: 10 }}>Cantidad</th>
                  <th style={{ padding: 10 }}>Origen</th>
                  <th style={{ padding: 10 }}>Estado</th>
                  <th style={{ padding: 10 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shoppingList.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: 10, fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: 10 }}>{item.quantity_suggested}</td>
                    <td style={{ padding: 10, color: '#aaa' }}>{item.source}</td>
                    <td style={{ padding: 10, color: item.status === 'pending' ? '#ffcc00' : '#4bb543' }}>{item.status}</td>
                    <td style={{ padding: 10 }}>
                      {item.status === 'pending' && (
                        <button onClick={() => buyItem(item.id)} style={{ marginRight: 5, background: '#28a745', color: '#fff', border: 'none', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' }}>Comprado & Reabastecer</button>
                      )}
                      <button onClick={() => fetch(`${API_BASE}/shopping/${item.id}`, { method: 'DELETE' }).then(loadShopping)} style={{ background: '#8b0000', color: '#fff', border: 'none', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' }}>Borrar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* PESTAÑA: PRECIOS */}
      {tab === 'prices' && (
        <div>
          <h2 style={{ fontSize: '18px', textTransform: 'uppercase', borderBottom: '1px solid #333', paddingBottom: 8, letterSpacing: '1px' }}>Comparación de Precios en Colombia</h2>
          
          <form onSubmit={searchPrices} style={{ marginBottom: 25, display: 'flex', gap: 10 }}>
            <input placeholder="Buscar producto (ej. leche deslactosada alpina, cafe)" value={priceQuery} onChange={e => setPriceQuery(e.target.value)} required style={{ flex: 1, padding: 10, background: '#181818', border: '1px solid #444', color: '#fff' }} />
            <button type="submit" style={{ padding: '10px 20px', background: '#ff3333', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', fontSize: '11px' }}>Buscar Precios</button>
          </form>

          {priceResults && (
            <div>
              <h3 style={{ fontSize: '15px', textTransform: 'uppercase', color: '#aaa' }}>Resultados para "{priceResults.query}" <span style={{fontSize: '11px', fontFamily: 'monospace', color: '#666'}}>[Traza: {priceResults.trace_id}]</span></h3>
              
              {buyBetter && (
                <div style={{ background: '#1e291e', color: '#a3e635', padding: '12px 18px', borderRadius: 0, marginBottom: 20, borderLeft: '5px solid #4bb543' }}>
                  <strong>💡 Sugerencia "Comprar Mejor":</strong> {buyBetter.suggestion}
                </div>
              )}

              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#1a1a1a', textAlign: 'left', borderBottom: '2px solid #333', color: '#aaa', textTransform: 'uppercase', fontSize: '11px' }}>
                    <th style={{ padding: 10 }}>Supermercado</th>
                    <th style={{ padding: 10 }}>Precio Aprox.</th>
                    <th style={{ padding: 10 }}>Enlace</th>
                  </tr>
                </thead>
                <tbody>
                  {priceResults.results.map((res, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: 10, fontWeight: 600 }}>{res.store}</td>
                      <td style={{ padding: 10 }}>${res.price.toLocaleString()} {res.currency}</td>
                      <td style={{ padding: 10 }}><a href={res.url} target="_blank" rel="noreferrer" style={{ color: '#ff6b6b' }}>Visitar Tienda</a></td>
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
