'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function CocinaPage() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    // 1. Cargar pedidos desde Supabase usando la columna correcta 'creado_at'
    const cargarPedidos = async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('creado_at', { ascending: false });

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
        { event: '*', schema: 'public', table: 'pedidos' },
        () => {
          cargarPedidos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const marcarComoCompletado = async (id) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: 'completado' })
      .eq('id', id);

    if (!error) {
      setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: 'completado' } : p));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cocina - Pedidos en Vivo</h1>
        <Link href="/" className="bg-gray-600 text-white px-4 py-2 rounded">
          Volver al Inicio
        </Link>
      </div>

      <div className="grid gap-4">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="border p-4 rounded shadow bg-white text-black">
            <p className="font-bold text-lg">Pedido #{pedido.id}</p>
            <p className="my-2">{pedido.detalle}</p>
            <p className="text-sm text-gray-600 mb-2">Total: S/ {pedido.total}</p>
            <p className="text-xs mb-3">Estado: <span className="font-semibold uppercase">{pedido.estado}</span></p>
            
            <button
              onClick={() => marcarComoCompletado(pedido.id)}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white py-2 rounded font-bold"
            >
              Completado / Entregado ✅
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}