'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function CocinaPage() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    cargarPedidos();

    // Escuchar pedidos en tiempo real con Supabase
    const channel = supabase
      .channel('realtime-pedidos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        cargarPedidos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const cargarPedidos = async () => {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('estado', 'pendiente')
      .order('id', { ascending: false });

    if (!error && data) {
      setPedidos(data);
    }
  };

  const marcarComoCompletado = async (id) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: 'completado' })
      .eq('id', id);

    if (!error) {
      cargarPedidos();
    } else {
      alert('Error al actualizar el estado del pedido');
    }
  };

  // Función para limpiar y separar el texto guardado en la base de datos
  const formatearDetallePedido = (textoDetalle) => {
    // Ejemplo de texto guardado: "🛍️ PARA LLEVAR: PEPE -> 1x 1/2 Pollo + Papas, 2x Chicha"
    if (!textoDetalle.includes('->')) return { tipo: 'PEDIDO', destino: '', items: [textoDetalle] };

    const partes = textoDetalle.split('->');
    const cabecera = partes[0].trim(); // 🛍️ PARA LLEVAR: PEPE o 🍽️ MESA: 4
    const restoItems = partes[1].trim();

    // Separar los items por comas para mostrarlos en lista vertical
    const items = restoItems.split(',').map(item => item.trim());

    return { cabecera, items };
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
          <h1 className="text-2xl md:text-3xl font-black text-amber-400">🍳 Cocina - Flama Roja</h1>
          <Link href="/caja" className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-semibold transition border border-gray-700">
            Ir a Caja 🪙
          </Link>
        </div>

        {pedidos.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
            <p className="text-2xl font-bold text-gray-400">No hay pedidos pendientes 🕒</p>
            <p className="text-sm text-gray-500 mt-2">Los nuevos pedidos aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pedidos.map((p) => {
              const { cabecera, items } = formatearDetallePedido(p.detalle);
              const esLlevar = cabecera.includes('LLEVAR');

              return (
                <div 
                  key={p.id} 
                  className={`bg-gray-900 border-2 rounded-2xl p-5 shadow-2xl flex flex-col justify-between transition ${
                    esLlevar ? 'border-blue-500/80 bg-blue-950/20' : 'border-amber-500/80'
                  }`}
                >
                  <div>
                    {/* Cabecera del ticket (Número de pedido y Tipo/Mesa) */}
                    <div className="flex justify-between items-start mb-3 border-b border-gray-800 pb-3">
                      <div>
                        <span className="text-xs font-bold text-gray-400 block">ORDEN</span>
                        <span className="text-2xl font-black text-white">#{p.id}</span>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                        esLlevar ? 'bg-blue-600 text-white shadow-lg' : 'bg-amber-500 text-gray-950 shadow-lg'
                      }`}>
                        {cabecera}
                      </span>
                    </div>

                    {/* Lista de productos limpia en vertical */}
                    <div className="space-y-2 my-4">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-gray-800/80 p-2.5 rounded-xl border border-gray-700/60">
                          <span className="text-amber-400 font-bold">•</span>
                          <span className="text-base font-bold text-gray-100 leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-400 mb-4 bg-gray-950/50 p-2 rounded-lg">
                      <span>Total cobrado: S/ {Number(p.total).toFixed(2)}</span>
                      <span className="text-amber-400 font-bold uppercase">Estado: Pendiente</span>
                    </div>

                    <button
                      onClick={() => marcarComoCompletado(p.id)}
                      className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg text-base flex items-center justify-center gap-2 active:scale-95"
                    >
                      <span>Completado / Entregado</span>
                      <span>✅</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}