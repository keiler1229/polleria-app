'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function CajaPage() {
  const [productosMenu, setProductosMenu] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState([]);
  const [mesa, setMesa] = useState('');
  const [cargando, setCargando] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  
  const [modoAdmin, setModoAdmin] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('Pollos');

  useEffect(() => {
    cargarMenu();
  }, []);

  const cargarMenu = async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: true });

    if (!error && data) {
      setProductosMenu(data);
    }
  };

  const agregarAlPedido = (prod) => {
    // Verificar si el producto ya está en el pedido para sumarle cantidad
    const indexExistente = pedidoSeleccionado.findIndex(item => item.id === prod.id);
    if (indexExistente >= 0) {
      const nuevoPedido = [...pedidoSeleccionado];
      nuevoPedido[indexExistente].cantidad += 1;
      setPedidoSeleccionado(nuevoPedido);
    } else {
      setPedidoSeleccionado([...pedidoSeleccionado, { ...prod, cantidad: 1 }]);
    }
  };

  const cambiarCantidad = (index, delta) => {
    const nuevoPedido = [...pedidoSeleccionado];
    nuevoPedido[index].cantidad += delta;
    if (nuevoPedido[index].cantidad <= 0) {
      nuevoPedido.splice(index, 1);
    }
    setPedidoSeleccionado(nuevoPedido);
  };

  const quitarDelPedido = (index) => {
    const nuevoPedido = pedidoSeleccionado.filter((_, i) => i !== index);
    setPedidoSeleccionado(nuevoPedido);
  };

  const totalPagar = pedidoSeleccionado.reduce((acc, item) => acc + (Number(item.precio) * item.cantidad), 0);

  const enviarPedidoACocina = async () => {
    if (pedidoSeleccionado.length === 0) {
      alert('Agrega al menos un producto al pedido.');
      return;
    }
    if (!mesa.trim()) {
      alert('Por favor, indica el número de mesa o nombre del cliente.');
      return;
    }

    setCargando(true);

    const detalleTexto = pedidoSeleccionado.map(p => `${p.cantidad}x ${p.nombre}`).join(', ');
    const detalleConMesa = `📍 ${mesa.toUpperCase()} -> ${detalleTexto}`;

    const { error } = await supabase
      .from('pedidos')
      .insert([
        { 
          detalle: detalleConMesa, 
          total: totalPagar, 
          estado: 'pendiente' 
        }
      ]);

    setCargando(false);

    if (!error) {
      alert('¡Pedido enviado a cocina con éxito! 🍗');
      setPedidoSeleccionado([]);
      setMesa('');
    } else {
      alert('Hubo un error al enviar el pedido');
    }
  };

  const agregarPlatoAlMenu = async (e) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoPrecio) return;

    const { error } = await supabase
      .from('productos')
      .insert([
        { 
          nombre: nuevoNombre, 
          precio: parseFloat(nuevoPrecio), 
          categoria: nuevaCategoria, 
          disponible: true 
        }
      ]);

    if (!error) {
      setNuevoNombre('');
      setNuevoPrecio('');
      setNuevaCategoria('Pollos');
      cargarMenu();
      alert('¡Plato agregado a la carta exitosamente!');
    } else {
      alert('Error al agregar el plato a Supabase');
    }
  };

  const eliminarPlatoDelMenu = async (id) => {
    if (confirm('¿Seguro que deseas eliminar este plato de la carta?')) {
      const { error } = await supabase.from('productos').delete().eq('id', id);
      if (!error) {
        cargarMenu();
      }
    }
  };

  const categoriasUnicas = ['Todos', ...new Set(productosMenu.map(p => p.categoria || 'Otros'))];

  const productosFiltrados = productosMenu.filter(p => {
    const coincideCategoria = categoriaActiva === 'Todos' || (p.categoria || 'Otros') === categoriaActiva;
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-800 pb-4 gap-4">
          <h1 className="text-2xl md:text-3xl font-black text-amber-400">🔥 Caja - Flama Roja</h1>
          <div className="flex gap-3 w-full md:w-auto justify-end">
            <button 
              onClick={() => setModoAdmin(!modoAdmin)}
              className="bg-amber-600 hover:bg-amber-500 px-4 py-2.5 rounded-xl text-sm font-semibold transition text-white shadow-lg flex-1 md:flex-none"
            >
              {modoAdmin ? '🔙 Volver a Caja' : '⚙️ Editar Carta'}
            </button>
            <Link href="/cocina" className="bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition border border-gray-700 flex-1 md:flex-none text-center">
              Ver Cocina 🍳
            </Link>
          </div>
        </div>

        {modoAdmin ? (
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-2xl max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-amber-400">Administrar Carta y Precios</h2>
            
            <form onSubmit={agregarPlatoAlMenu} className="space-y-4 mb-8 bg-gray-900 p-4 rounded-xl border border-gray-700">
              <h3 className="font-semibold text-gray-300">Agregar nuevo plato o bebida:</h3>
              <input
                type="text"
                placeholder="Nombre (Ej: Arroz Chaufa de Pollo)"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Precio en Soles (Ej: 22.00)"
                value={nuevoPrecio}
                onChange={(e) => setNuevoPrecio(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
                required
              />
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Seleccionar Sección:</label>
                <select
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white font-medium"
                >
                  <option value="Pollos">Pollos a la Brasa</option>
                  <option value="Parrillas">Parrillas</option>
                  <option value="Chaufas">Chaufas y Platos</option>
                  <option value="Entradas">Entradas / Aguadito</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Extras">Extras y Porciones</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 font-bold py-3 rounded-lg text-white transition">
                Guardar Nuevo Plato 📝
              </button>
            </form>

            <h3 className="font-semibold text-gray-300 mb-3">Platos actuales en la carta:</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {productosMenu.map((prod) => (
                <div key={prod.id} className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-700">
                  <div>
                    <span className="font-bold">{prod.nombre}</span>
                    <span className="text-amber-400 ml-4 font-semibold">S/ {Number(prod.precio).toFixed(2)}</span>
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded ml-3">{prod.categoria}</span>
                  </div>
                  <button 
                    onClick={() => eliminarPlatoDelMenu(prod.id)}
                    className="bg-red-600/20 text-red-400 border border-red-900 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition"
                  >
                    Eliminar 🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Buscador y Categorías */}
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="🔍 Buscar plato o bebida..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full md:w-1/2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 font-medium"
                />
                
                <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
                  {categoriasUnicas.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoriaActiva(cat)}
                      className={`px-3 py-2 rounded-xl font-bold text-xs md:text-sm transition whitespace-nowrap ${
                        categoriaActiva === cat 
                          ? 'bg-amber-500 text-gray-950 shadow-lg' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuadrícula de productos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {productosFiltrados.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => agregarAlPedido(prod)}
                    className="bg-gray-800 hover:bg-amber-600/20 border border-gray-700 hover:border-amber-500 p-4 rounded-2xl text-left flex flex-col justify-between transition shadow-lg group active:scale-95"
                  >
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-amber-500/80 font-bold block mb-1">{prod.categoria}</span>
                      <span className="font-bold text-gray-100 group-hover:text-amber-400 text-sm md:text-base leading-snug">{prod.nombre}</span>
                    </div>
                    <span className="text-amber-400 font-black mt-4 text-base md:text-lg">S/ {Number(prod.precio).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel de Resumen del Pedido */}
            <div className="bg-gray-800 border border-gray-700 p-5 rounded-2xl shadow-2xl flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold mb-3 text-amber-400 border-b border-gray-700 pb-2">Resumen del Pedido</h2>
                
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mesa o Cliente:</label>
                  <input
                    type="text"
                    value={mesa}
                    onChange={(e) => setMesa(e.target.value)}
                    placeholder="Ej: Mesa 4"
                    className="w-full bg-gray-900 border border-amber-500/50 rounded-xl p-3 text-white font-bold focus:outline-none text-base"
                    required
                  />
                </div>

                {pedidoSeleccionado.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 text-sm">Ningún producto seleccionado.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {pedidoSeleccionado.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-900 p-2.5 rounded-xl border border-gray-700/50">
                        <div className="flex-1 pr-2">
                          <p className="text-xs font-semibold text-gray-200">{item.nombre}</p>
                          <p className="text-xs text-amber-400 font-bold">S/ {(Number(item.precio) * item.cantidad).toFixed(2)}</p>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => cambiarCantidad(index, -1)}
                            className="w-7 h-7 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg border border-gray-700 flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold">{item.cantidad}</span>
                          <button 
                            onClick={() => cambiarCantidad(index, 1)}
                            className="w-7 h-7 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg border border-gray-700 flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                          <button 
                            onClick={() => quitarDelPedido(index)}
                            className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 bg-red-950/40 rounded-lg border border-red-900/40 ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex justify-between items-center mb-4 text-xl font-black">
                  <span>Total:</span>
                  <span className="text-amber-400">S/ {totalPagar.toFixed(2)}</span>
                </div>

                <button
                  onClick={enviarPedidoACocina}
                  disabled={cargando || pedidoSeleccionado.length === 0}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-gray-700 disabled:text-gray-500 text-gray-950 font-bold py-3.5 rounded-xl transition shadow-lg text-base flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>{cargando ? 'Enviando...' : 'Enviar a Cocina'}</span>
                  <span>🚀</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}