'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Pollo Entero + Papas + Ensalada', precio: 75 },
    { id: 2, nombre: '1/2 Pollo + Papas + Ensalada', precio: 40 },
    { id: 3, nombre: '1/4 de Pollo + Papas', precio: 22 },
    { id: 4, nombre: 'Chicha Morada 1 Litro', precio: 8 },
    { id: 5, nombre: 'Gaseosa 1.5 Litros', precio: 10 },
    { id: 6, nombre: 'Porción de Salchipapa', precio: 18 },
  ]);

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [ventas, setVentas] = useState([]);

  // Cargar productos y ventas guardadas
  useEffect(() => {
    const guardados = localStorage.getItem('productos_flama_roja');
    if (guardados) {
      setProductos(JSON.parse(guardados));
    }

    const ventasGuardadas = localStorage.getItem('historial_ventas_flama');
    if (ventasGuardadas) {
      setVentas(JSON.parse(ventasGuardadas));
    }
  }, []);

  const guardarCambios = (nuevosProductos) => {
    setProductos(nuevosProductos);
    localStorage.setItem('productos_flama_roja', JSON.stringify(nuevosProductos));
  };

  const cambiarPrecio = (id, nuevoPrecioStr) => {
    const precioNum = parseFloat(nuevoPrecioStr) || 0;
    const actualizados = productos.map(p => p.id === id ? { ...p, precio: precioNum } : p);
    guardarCambios(actualizados);
  };

  const agregarProducto = (e) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoPrecio) return;
    const nuevo = {
      id: Date.now(),
      nombre: nuevoNombre,
      precio: parseFloat(nuevoPrecio) || 0
    };
    const actualizados = [...productos, nuevo];
    guardarCambios(actualizados);
    setNuevoNombre('');
    setNuevoPrecio('');
  };

  const eliminarProducto = (id) => {
    const actualizados = productos.filter(p => p.id !== id);
    guardarCambios(actualizados);
  };

  const limpiarHistorial = () => {
    if (confirm('¿Deseas cerrar el día y borrar el historial de ventas?')) {
      localStorage.removeItem('historial_ventas_flama');
      setVentas([]);
    }
  };

  const totalGeneral = ventas.reduce((sum, v) => sum + (v.total || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">⚙️ Administración - Flama Roja</h1>
          <Link href="/" className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg text-sm">
            Menú Principal
          </Link>
        </div>

        {/* REPORTE DE VENTAS DEL DÍA */}
        <div className="bg-zinc-800 border border-zinc-700 p-5 rounded-xl mb-6 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-amber-400">📊 Ventas del Día</h2>
            {ventas.length > 0 && (
              <button 
                onClick={limpiarHistorial}
                className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs font-semibold transition"
              >
                Cerrar Día 🗑️
              </button>
            )}
          </div>
          <div className="mb-4">
            <span className="text-zinc-400 text-xs block">Total Recaudado</span>
            <span className="text-2xl font-extrabold text-amber-400">S/ {totalGeneral.toFixed(2)}</span>
          </div>

          {ventas.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">No hay ventas registradas todavía.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {ventas.map((v) => (
                <div key={v.id} className="bg-zinc-900 p-2.5 rounded border border-zinc-800 text-sm flex justify-between items-center">
                  <div>
                    <span className="font-bold text-amber-500 mr-2">{v.mesa}</span>
                    <span className="text-zinc-300">({v.items.length} ítems)</span>
                    <span className="text-zinc-500 text-xs ml-2">⏰ {v.hora}</span>
                  </div>
                  <span className="font-bold text-amber-400">S/ {v.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulario para agregar producto */}
        <form onSubmit={agregarProducto} className="bg-zinc-800 p-4 rounded-xl mb-6 border border-zinc-700">
          <h2 className="text-lg font-semibold mb-3">Agregar Nuevo Plato o Bebida</h2>
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              placeholder="Nombre del producto (ej. 1/8 Pollo)" 
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg text-white"
            />
            <input 
              type="number" 
              placeholder="Precio en S/ (ej. 15)" 
              value={nuevoPrecio}
              onChange={(e) => setNuevoPrecio(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg text-white"
            />
            <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 rounded-lg transition">
              Añadir Producto
            </button>
          </div>
        </form>

        {/* Lista de productos para modificar */}
        <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700">
          <h2 className="text-lg font-semibold mb-3">Modificar Precios Actuales</h2>
          <div className="flex flex-col gap-4">
            {productos.map((prod) => (
              <div key={prod.id} className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800 gap-3">
                <span className="flex-1 font-medium">{prod.nombre}</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">S/</span>
                  <input 
                    type="number" 
                    value={prod.precio}
                    onChange={(e) => cambiarPrecio(prod.id, e.target.value)}
                    className="w-20 bg-zinc-800 border border-zinc-700 p-2 rounded text-center text-white font-bold"
                  />
                  <button 
                    onClick={() => eliminarProducto(prod.id)}
                    className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}