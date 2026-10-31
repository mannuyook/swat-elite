import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, Award, BookOpen, ShieldCheck } from 'lucide-react';

export function UserProfileModal({ user, onClose }) {
  const [cursos, setCursos] = useState([]);
  const [medallas, setMedallas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const cargarDetalles = async () => {
      setLoading(true);
      try {
        // Cargar Cursos aprobados del usuario
        const { data: cursosData } = await supabase
          .from('cursos_asignados')
          .select('*, cursos(nombre, descripcion, imagen)')
          .eq('usuario_id', user.id)
          .eq('estado', 'aprobado');

        // Cargar Medallas otorgadas al usuario
        const { data: medallasData } = await supabase
          .from('medallas_otorgadas')
          .select('*, medallas(nombre, descripcion, imagen)')
          .eq('usuario_id', user.id);

        setCursos(cursosData || []);
        setMedallas(medallasData || []);
      } catch (err) {
        console.error('Error al cargar perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarDetalles();
  }, [user]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0a152d] border border-[#1e3a70] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabecera del Modal */}
        <div className="bg-[#112347] border-b border-[#1e3a70] p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-slate-100 font-black text-sm uppercase tracking-wider">
            <ShieldCheck className="w-5 h-5 text-[#3b82f6]" />
            <span>Perfil Oficial de Agente SWAT</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0a152d] hover:bg-red-900/50 text-[#94a3b8] hover:text-red-200 border border-[#1e3a70] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tarjeta Central del Agente */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex justify-center">
            <div className="bg-[#112347] border border-[#1e3a70] rounded-xl p-6 text-center w-full max-w-xs shadow-xl">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full border-2 border-[#3b82f6] bg-[#0a152d] flex items-center justify-center overflow-hidden">
                {user.avatar_base64 ? (
                  <img src={user.avatar_base64} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-slate-300">{user.username?.[0]}</span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide">{user.username}</h3>
              <span className="inline-block mt-1 px-3 py-0.5 bg-[#3b82f6]/20 border border-[#3b82f6]/50 rounded-full text-[11px] font-bold text-[#3b82f6] uppercase">
                {user.rango || 'Agente'}
              </span>
              <div className="mt-4 pt-3 border-t border-[#1e3a70] flex justify-between text-[11px] text-[#94a3b8]">
                <span>Rol: <strong className="text-slate-200 uppercase">{user.rol}</strong></span>
                <span>ID: <strong className="text-slate-200">#{user.id}</strong></span>
              </div>
            </div>
          </div>

          {/* Dos Columnas: Cursos y Medallas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Columna Cursos */}
            <div className="bg-[#112347] border border-[#1e3a70] rounded-xl p-5 shadow-lg">
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-4 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-[#3b82f6]" />
                Cursos Completados
              </h4>
              
              {loading ? (
                <p className="text-xs text-[#94a3b8] text-center py-4">Cargando cursos...</p>
              ) : cursos.length === 0 ? (
                <p className="text-xs text-[#94a3b8] text-center py-4">No registra cursos aprobados.</p>
              ) : (
                <div className="space-y-3">
                  {cursos.map((item) => (
                    <div key={item.id} className="bg-[#0a152d] border border-[#1e3a70] p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-200">{item.cursos?.nombre || 'Curso'}</p>
                        <p className="text-[10px] text-[#94a3b8]">{item.cursos?.descripcion || 'Sin descripción'}</p>
                      </div>
                      <div className="w-10 h-10 bg-[#112347] border border-[#1e3a70] rounded-lg flex items-center justify-center p-1">
                        <img 
                          src={item.cursos?.imagen || '/logo.jpg'} 
                          alt="Logo Curso" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Columna Medallas */}
            <div className="bg-[#112347] border border-[#1e3a70] rounded-xl p-5 shadow-lg">
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-4 flex items-center">
                <Award className="w-4 h-4 mr-2 text-amber-400" />
                Medallas y Reconocimientos
              </h4>

              {loading ? (
                <p className="text-xs text-[#94a3b8] text-center py-4">Cargando medallas...</p>
              ) : medallas.length === 0 ? (
                <p className="text-xs text-[#94a3b8] text-center py-4">No registra medallas otorgadas.</p>
              ) : (
                <div className="space-y-3">
                  {medallas.map((item) => (
                    <div key={item.id} className="bg-[#0a152d] border border-[#1e3a70] p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-200">{item.medallas?.nombre || 'Medalla'}</p>
                        <p className="text-[10px] text-[#94a3b8]">{item.medallas?.descripcion || 'Honor al mérito'}</p>
                      </div>
                      <div className="w-10 h-10 bg-[#112347] border border-[#1e3a70] rounded-lg flex items-center justify-center p-1">
                        <img 
                          src={item.medallas?.imagen || '/logo.jpg'} 
                          alt="Logo Medalla" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}