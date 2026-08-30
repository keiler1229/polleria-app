'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xqimttwyoghvqawylsbt.supabase.co'
const supabaseKey = 'sb_publishable_1XEFN9zedpUePqIND4SByQ_lDUwBl_1'
const supabase = createClient(supabaseUrl, supabaseKey)

export default function CocinaPolleria() {
  const [pedidos, setPedidos] = useState([])

  useEffect(() => {
    async function cargarPedidos() {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('estado', 'pendiente')
        .order('id', { ascending: true })
      
      if (error) console.error('Error al cargar pedidos:', error)
      else setPedidos(data)
    }

    cargarPedidos()

    const canal = supabase
      .channel('realtime-pedidos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, payload => {
        setPedidos(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [])

  const marcarComoCompletado = async (id) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: 'completado' })
      .eq('id', id)

    if (error) {
      console.error(error)
    } else {
      setPedidos(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: '#121212', minHeight: '100vh', color: '#fff' }}>
      <h2>Pedidos Pendientes en Cocina</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', marginTop: '20px' }}>
        {pedidos.length === 0 ? (
          <p style={{ color: '#aaa' }}>No hay pedidos pendientes por ahora.</p>
        ) : (
          pedidos.map(pedido => (
            <div key={pedido.id} style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
              <span style={{ fontSize: '14px', color: '#f39c12' }}>Pedido #{pedido.id}</span>
              <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '10px 0' }}>{pedido.detalle}</p>
              <button 
                onClick={() => marcarComoCompletado(pedido.id)}
                style={{ width: '100%', padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}
              >
                Marcar como Listos
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}