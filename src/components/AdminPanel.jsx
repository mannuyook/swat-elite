import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { ShieldAlert, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';

export function AdminPanel() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarPostulaciones = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: dbError } = await supabase
        .from('curso_postulaciones')
        .select('*')
        .order('fecha', { ascending: false });

      if (dbError) throw dbError;
      setPostulaciones(data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar las postulaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPostulaciones();
  }, []);

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const { error: updateError } = await supabase
        .from('curso_postulaciones')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (updateError) throw updateError;

      // Actualizar estado localmente
      setPostulaciones(prev =>
        prev.map(item => (item.id === id ? { ...item, estado: nuevoEstado } : item))
      );
    } catch (err) {
      alert('Error al actualizar estado: ' + err.message);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-4 sm:p-6 font-sans">
      
      {/* CABECERA */}
      <div className="bg-[#112347] border border-[#1e3a70] rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider flex items-center">
            <ShieldAlert className="w-6 h-6 mr-2 text-amber-500" />
            Panel de Administración y Control
          </h2>
          <p className="text-xs text-[#94a3b8] mt-1">
            Gestión de solicitudes de capacitación y aprobación de aspirantes.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 text-xs text-center">
          {error}
        </div>
      )}

      {/* TABLA DE SOLICITUDES */}
      <div className="bg-[#112347] border border-[#1e3a70] rounded-xl p-6 shadow-xl overflow-x-auto">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 flex items-center">
          <UserCheck className="w-4 h-4 mr-2 text-[#3b82f6]" />
          Postulaciones a Cursos Recibidas
        </h3>

        {loading ? (
          <div className="text-center py-8 text-[#94a3b8] text-sm animate-pulse">
            Cargando solicitudes desde Supabase...
          </div>
        ) : postulaciones.length === 0 ? (
          <div className="text-center py-8 text-[#94a3b8] text-sm">
            No hay postulaciones registradas por el momento.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e3a70] text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">
                <th className="py-3 px-4">Agente</th>
                <th className="py-3 px-4">Curso</th>
                <th className="py-3 px-4">Motivo / Experiencia</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3a70] text-xs">
              {postulaciones.map((post) => (
                <tr key={post.id} className="hover:bg-[#0a152d]/50 transition-all">
                  <td className="py-3 px-4 font-bold text-slate-200">{post.username}</td>
                  <td className="py-3 px-4 text-[#3b82f6] font-semibold">{post.curso}</td>
                  <td className="py-3 px-4 text-[#cbd5e1] max-w-xs truncate">{post.motivo}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      post.estado === 'Aprobado'
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                        : post.estado === 'Rechazado'
                        ? 'bg-red-950/60 border-red-500/50 text-red-400'
                        : 'bg-amber-950/60 border-amber-500/50 text-amber-400'
                    }`}>
                      {post.estado || 'Pendiente'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => actualizarEstado(post.id, 'Aprobado')}
                        className="p-1.5 bg-emerald-900/30 hover:bg-emerald-600/50 border border-emerald-500/50 rounded-lg text-emerald-300 transition-all"
                        title="Aprobar Solicitud"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => actualizarEstado(post.id, 'Rechazado')}
                        className="p-1.5 bg-red-900/30 hover:bg-red-600/50 border border-red-500/50 rounded-lg text-red-300 transition-all"
                        title="Rechazar Solicitud"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default AdminPanel;