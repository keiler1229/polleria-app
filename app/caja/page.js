'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xqimttwyoghvqawylsbt.supabase.co'
const supabaseKey = 'sb_publishable_1XEFN9zedpUePqIND4SByQ_lDUwBl_1' // Reemplaza con tu key real si falta
const supabase = createClient(supabaseUrl, supabaseKey)

export default function CajaPolleria() {
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function cargarProductos() {
      const { data, error } = await supabase.from('productos').select('*')
      if (error) console.error('Error al cargar productos:', error)
      else setProductos(data)
    }
    cargarProductos()
  }, [])

  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto])
    setTotal(prevTotal => prevTotal + Number(producto.precio))
  }

  const enviarPedido = async () => {
    if (carrito.length === 0) return alert('El carrito está vacío')

    const detalleTexto = carrito.map(p => p.nombre).join(', ')

    const { error } = await supabase.from('pedidos').insert([
      { detalle: detalleTexto, total: total, estado: 'pendiente' }
    ])

    if (error) {
      alert('Error al enviar el pedido')
      console.error(error)
    } else {
      alert('¡Pedido enviado a cocina con éxito!')
      setCarrito([])
      setTotal(0)
    }
  }

  return (
    <div style={{ display: 'flex', padding: '20px', gap: '20px', fontFamily: 'sans-serif', background: '#121212', minHeight: '100vh', color: '#fff' }}>
      <div style={{ flex: 2 }}>
        <h2>Menú de la Pollería</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '15px' }}>
          {productos.map(prod => (
            <button 
              key={prod.id} 
              onClick={() => agregarAlCarrito(prod)}
              style={{ padding: '20px', background: '#f4f4f4', color: '#000', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}
            >
              <strong style={{ fontSize: '16px', color: '#000' }}>{prod.nombre}</strong>
              <p style={{ margin: '8px 0 0 0', color: '#333', fontSize: '15px', fontWeight: 'bold' }}>S/ {prod.precio}</p>
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, background: '#1e1e1e', padding: '20px', border: '1px solid #333', borderRadius: '8px' }}>
        <h2>Pedido Actual</h2>
        <ul style={{ listStyle: 'none', padding: 0, minHeight: '150px', marginTop: '15px' }}>
          {carrito.map((item, index) => (
            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#fff' }}>
              <span>{item.nombre}</span>
              <span>S/ {item.precio}</span>
            </li>
          ))}
        </ul>
        <hr style={{ borderColor: '#444' }} />
        <h3 style={{ margin: '15px 0' }}>Total a Pagar: S/ {total.toFixed(2)}</h3>
        <button 
          onClick={enviarPedido}
          style={{ width: '100%', padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
        >
          Enviar a Cocina
        </button>
      </div>
    </div>
  )
}