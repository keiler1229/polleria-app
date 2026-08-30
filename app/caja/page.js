'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CajaPage() {
  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Pollo Entero + Papas + Ensalada', precio: 75 },
    { id: 2, nombre: '1/2 Pollo + Papas + Ensalada', precio: 40 },
    { id: 3, nombre: '1/4 de Pollo + Papas', precio: 22 },
    { id: 4, nombre: 'Chicha Morada 1 Litro', precio: 8 },
    { id: 5, nombre: 'Gaseosa 1.5 Litros', precio: 10 },
    { id: 6, nombre: 'Porción de Salchipapa', precio: 18 },
  ]);

  const [pedido, setPedido] = useState([]);
  const [mesa, setMesa] = useState('Mesa 1');

  useEffect(() => {
    const guardados = localStorage.getItem('productos_flama_roja');
    if (guardados) {
      setProductos(JSON.parse(guardados));
    }
  }, []);

  const agregarAlPedido = (producto) => {
    setPedido([...pedido, producto]);
  };

  const quitarDelPedido = (index) => {
    const nuevoPedido = pedido.filter((_, i) => i !== index);
    setPedido(nuevoPedido);
  };

  const total = pedido.reduce((sum, item) => sum + item.precio, 0);

  const enviarPedidoCocina = () => {
    if (pedido.length === 0) return;
    
    const pedidosAnteriores = JSON.parse(localStorage.getItem('pedidos_cocina_flama')) || [];
    
    const nuevoPedidoCocina = {
      id: Date.now(),
      mesa: mesa,
      items: pedido,
      total: total,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estado: 'Pendiente'
    };

    localStorage.setItem('pedidos_cocina_flama', JSON.stringify([nuevoPedidoCocina, ...pedidosAnteriores]));

    const historialAnterior = JSON.parse(localStorage.getItem('historial_ventas_flama')) || [];
    localStorage.setItem('historial_ventas_flama', JSON.stringify([nuevoPedidoCocina, ...historialAnterior]));

    alert(`¡Pedido enviado a cocina para la ${mesa}!`);
    setPedido([]);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">💰 Caja - Flama Roja</h1>
        <div className="flex gap-3">
          <Link href="/admin" className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg text-sm font-semibold">
            ⚙️ Administración
          </Link>
          <Link href="/" className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg text-sm">
            Menú Principal
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
          {productos.map((prod) => (
            <button
              key={prod.id}
              onClick={() => agregarAlPedido(prod)}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-4 rounded-xl text-left flex flex-col justify-between transition shadow-md"
            >
              <span className="font-semibold text-lg mb-2">{prod.nombre}</span>
              <span className="text-amber-400 font-bold text-xl">S/ {prod.precio.toFixed(2)}</span>
            </button>
          ))}
        </div>

        <div className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 flex flex-col justify-between h-fit">
          <div>
            <h2 className="text-lg font-semibold mb-3 border-b border-zinc-700 pb-2">Pedido Actual</h2>
            
            <div className="mb-4">
              <label className="block text-xs text-zinc-400 mb-1 font-semibold">NÚMERO DE MESA / CLIENTE</label>
              <input 
                type="text" 
                value={mesa} 
                onChange={(e) => setMesa(e.target.value)}
                placeholder="Ej. Mesa 3 o Llevar"
                className="w-full bg-zinc-900 border border-zinc-700 p-2 rounded text-white font-bold"
              />
            </div>

            {pedido.length === 0 ? (
              <p className="text-zinc-400 text-sm italic">No hay productos seleccionados.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto mb-4">
                {pedido.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-zinc-900 p-2 rounded border border-zinc-800 text-sm">
                    <span>{item.nombre}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-medium">S/ {item.precio.toFixed(2)}</span>
                      <button onClick={() => quitarDelPedido(index)} className="text-red-400 hover:text-red-300 font-bold">×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-zinc-700 pt-4 mt-4">
            <div className="flex justify-between items-center text-xl font-bold mb-4">
              <span>Total:</span>
              <span className="text-amber-400">S/ {total.toFixed(2)}</span>
            </div>
            <button
              onClick={enviarPedidoCocina}
              disabled={pedido.length === 0}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold py-3 rounded-xl transition shadow-lg"
            >
              Enviar a Cocina 🍳
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}