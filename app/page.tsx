import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 text-white p-6">
      <div className="max-w-md w-full bg-zinc-800 p-8 rounded-2xl shadow-xl text-center border border-zinc-700">
        <h1 className="text-3xl font-bold mb-2">🔥 Flama Roja</h1>
        <p className="text-zinc-400 mb-8">Selecciona el área a la que deseas ingresar:</p>
        
        <div className="flex flex-col gap-4">
          <Link 
            href="/caja" 
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg"
          >
            Ir a Caja 💰
          </Link>
          
          <Link 
            href="/cocina" 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 shadow-lg"
          >
            Ir a Cocina 🍳
          </Link>
        </div>
      </div>
    </div>
  );
}