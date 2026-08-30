'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function CocinaPage() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    // 1. Cargar pedidos iniciales desde Supabase
    const cargarPedidos = async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('creado_en', { ascending: false });

      if (!error && data) {
        setPedidos(data);
      }
    };

    cargarPedidos();

    // 2. Escuchar nuevos pedidos en tiempo real
    const canal = supabase
      .channel('realtime-pedidos')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos' },
        (payload) => {
          setPedidos((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const marcarComoCompletado = async (id) => {
    // Eliminar de Supabase al terminar el plato
    const { error } = await supabase.from('pedidos').delete().eq('id', id);

    if (!error) {
      setPedidos(pedidos.filter((p) => p.id !== id));
    } else {
      alert('Error al actualizar el estado: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🍳 Cocina - Flama Roja</h1>
        <Link href="/" className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg text-sm">
          Volver al Menú
        </Link>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-xl">No hay pedidos pendientes en la cocina.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex justify-between items-center mb-3 border-b border-zinc-700 pb-2">
                  <span className="text-xl font-extrabold text-amber-400">{pedido.mesa}</span>
                  <span className="text-xs text-zinc-400">⏰ {pedido.hora}</span>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                  {pedido.items.map((item, index) => (
                    <div key={index} className="bg-zinc-900 p-2 rounded border border-zinc-800 text-sm flex justify-between">
                      <span>{item.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => marcarComoCompletado(pedido.id)}
                className="w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-2.5 rounded-lg transition"
              >
                Completado / Entregado ✅
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}