'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CocinaPage() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const cargarPedidos = () => {
      const guardados = localStorage.getItem('pedidos_cocina_flama');
      if (guardados) {
        setPedidos(JSON.parse(guardados));
      }
    };
    
    cargarPedidos();
    // Actualizar cada 3 segundos para ver nuevos pedidos automáticamente
    const intervalo = setInterval(cargarPedidos, 3000);
    return () => clearInterval(intervalo);
  }, []);

  const completarPedido = (id) => {
    const actualizados = pedidos.filter(p => p.id !== id);
    setPedidos(actualizados);
    localStorage.setItem('pedidos_cocina_flama', JSON.stringify(actualizados));
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🍳 Cocina - Flama Roja</h1>
        <Link href="/" className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg text-sm">
          Menú Principal
        </Link>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 text-lg">
          No hay pedidos pendientes en la cocina. ¡Buen trabajo! 🍗
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex justify-between items-center mb-3 border-b border-zinc-700 pb-2">
                  <span className="text-amber-400 font-bold text-sm">⏰ {pedido.hora}</span>
                  <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded font-medium">Pendiente</span>
                </div>
                <ul className="flex flex-col gap-2 mb-4">
                  {pedido.items.map((item, index) => (
                    <li key={index} className="text-zinc-200 text-base font-medium flex items-center gap-2">
                      <span className="text-amber-500">•</span> {item.nombre}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => completarPedido(pedido.id)}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-lg transition"
              >
                Marcar como Listo / Entregado ✔️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}