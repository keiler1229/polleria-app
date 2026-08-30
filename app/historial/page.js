'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HistorialPage() {
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    const guardadas = localStorage.getItem('historial_ventas_flama');
    if (guardadas) {
      setVentas(JSON.parse(guardadas));
    }
  }, []);

  const limpiarHistorial = () => {
    if (confirm('¿Estás seguro de borrar el historial de ventas del día?')) {
      localStorage.removeItem('historial_ventas_flama');
      setVentas([]);
    }
  };

  const totalGeneral = ventas.reduce((sum, v) => sum + (v.total || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📊 Historial de Ventas - Flama Roja</h1>
          <div className="flex gap-3">
            <Link href="/" className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg text-sm">
              Menú Principal
            </Link>
          </div>
        </div>

        {/* Resumen de Caja */}
        <div className="bg-zinc-800 border border-zinc-700 p-5 rounded-xl mb-6 flex justify-between items-center shadow-lg">
          <div>
            <span className="text-zinc-400 text-sm block">Total Recaudado Hoy</span>
            <span className="text-3xl font-extrabold text-amber-400">S/ {totalGeneral.toFixed(2)}</span>
          </div>
          {ventas.length > 0 && (
            <button 
              onClick={limpiarHistorial}
              className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              Cerrar / Borrar Día 🗑️
            </button>
          )}
        </div>

        {/* Lista de ventas */}
        {ventas.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 text-lg bg-zinc-800/50 rounded-xl border border-zinc-800">
            Aún no hay ventas registradas hoy.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {ventas.map((venta) => (
              <div key={venta.id} className="bg-zinc-800 border border-zinc-700 p-4 rounded-xl shadow">
                <div className="flex justify-between items-center border-b border-zinc-700 pb-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-500 text-black font-bold px-3 py-1 rounded text-sm">
                      {venta.mesa || 'Mesa'}
                    </span>
                    <span className="text-zinc-400 text-sm">⏰ {venta.hora}</span>
                  </div>
                  <span className="text-amber-400 font-bold text-lg">S/ {venta.total.toFixed(2)}</span>
                </div>
                <ul className="flex flex-col gap-1 text-sm text-zinc-300">
                  {venta.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>• {item.nombre}</span>
                      <span className="text-zinc-400">S/ {item.precio.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}