import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Activity, Clock, ShieldAlert, User, RefreshCw } from 'lucide-react';

export function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarMovimientos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('movimientos')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setMovimientos(data || []);
    } catch (err) {
      console.error('Error al cargar historial de movimientos:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* CABECERA DEL MÓDULO */}
      <div className="bg-[#0d172e] border border-[#1b315e] rounded-2xl p-6 flex justify-between items-center shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#13203c] border border-[#223966] rounded-xl flex items-center justify-center text-amber-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase text-white tracking-wider">Historial de Movimientos</h2>
            <p className="text-xs text-slate-400 font-semibold">Registro de auditoría y acciones en el portal táctico</p>
          </div>
        </div>
        <button 
          onClick={cargarMovimientos}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#13203c] hover:bg-[#1b315e] border border-[#223966] text-xs font-bold uppercase rounded-xl text-slate-300 transition-all cursor-pointer shadow-md"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* LISTA DE MOVIMIENTOS */}
      {loading ? (
        <div className="bg-[#0d172e] border border-[#1b315e] rounded-2xl p-8 text-center text-xs text-slate-400">
          Cargando registro de auditoría táctica...
        </div>
      ) : movimientos.length === 0 ? (
        <div className="bg-[#0d172e] border border-[#1b315e] rounded-2xl p-12 text-center space-y-3 shadow-xl">
          <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">No hay registros de movimientos en la base de datos.</p>
        </div>
      ) : (
        <div className="bg-[#0d172e] border border-[#1b315e] rounded-2xl overflow-hidden shadow-xl">
          <div className="divide-y divide-[#1b315e]">
            {movimientos.map((item) => (
              <div key={item.id} className="p-4 hover:bg-[#13203c]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                {/* QUIÉN Y QUÉ HIZO */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#13203c] border border-[#223966] flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black uppercase text-amber-400/90 bg-amber-950/30 border border-amber-800/40 px-2 py-0.5 rounded">
                        {item.tipo || 'GENERAL'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 mt-1">
                      {item.accion}
                    </p>
                  </div>
                </div>

                {/* FECHA Y HORA */}
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono self-end sm:self-center bg-[#070e1b]/60 px-3 py-1.5 rounded-xl border border-[#1b315e]">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.created_at ? new Date(item.created_at).toLocaleString('es-CO') : 'Reciente'}</span>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default Movimientos;