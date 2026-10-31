import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { BookOpen, Plus, Image as ImageIcon, X, CheckCircle2, Pencil, Trash2 } from 'lucide-react';

export function Cursos({ user }) {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenBase64, setImagenBase64] = useState('');
  const [previewImg, setPreviewImg] = useState('');
  
  const [notification, setNotification] = useState(null);

  // REGLA ESTRICTA: Solo Developer, Administrador o Auxiliar pueden gestionar cursos
  const rolUser = user?.rol ? user.rol.toLowerCase() : '';
  const puedeGestionarCursos = rolUser === 'developer' || rolUser === 'administrador';

  const cargarCursos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('cursos').select('*').order('id', { ascending: true });
      if (error) throw error;
      setCursos(data || []);
    } catch (err) {
      console.error('Error al cargar cursos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCursos();
  }, []);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenBase64(reader.result);
      setPreviewImg(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const abrirModalCrear = () => {
    if (!puedeGestionarCursos) return;
    setIsEditing(false);
    setCurrentId(null);
    setNombre('');
    setDescripcion('');
    setImagenBase64('');
    setPreviewImg('');
    setShowModal(true);
  };

  const abrirModalEditar = (curso) => {
    if (!puedeGestionarCursos) return;
    setIsEditing(true);
    setCurrentId(curso.id);
    setNombre(curso.nombre);
    setDescripcion(curso.descripcion || '');
    setImagenBase64(curso.imagen || '');
    setPreviewImg(curso.imagen || '');
    setShowModal(true);
  };

  const handleGuardarCurso = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !puedeGestionarCursos) return;

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('cursos')
          .update({ 
            nombre, 
            descripcion, 
            imagen: imagenBase64 || '/logo.jpg' 
          })
          .eq('id', currentId);

        if (error) throw error;

        await supabase.from('movimientos').insert([
          {
            usuario_id: user?.id || 'sistema',
            accion: `Actualizó el curso táctico "${nombre}"`,
            tipo: 'curso'
          }
        ]).catch(() => {});

        showToast(`¡Curso "${nombre}" actualizado con éxito!`);
      } else {
        const { error } = await supabase.from('cursos').insert([
          { 
            nombre, 
            descripcion, 
            imagen: imagenBase64 || '/logo.jpg' 
          }
        ]);

        if (error) throw error;

        await supabase.from('movimientos').insert([
          {
            usuario_id: user?.id || 'sistema',
            accion: `Creó el curso táctico "${nombre}"`,
            tipo: 'curso'
          }
        ]).catch(() => {});

        showToast(`¡Curso "${nombre}" creado con éxito!`);
      }

      setNombre('');
      setDescripcion('');
      setImagenBase64('');
      setPreviewImg('');
      setShowModal(false);
      cargarCursos();
    } catch (err) {
      console.error('Error al guardar curso:', err);
    }
  };

  const handleEliminarCurso = async (id, nombreCurso) => {
    if (!puedeGestionarCursos) return;
    if (!window.confirm(`¿Estás seguro de eliminar el curso "${nombreCurso}"?`)) return;

    try {
      const { error } = await supabase.from('cursos').delete().eq('id', id);
      if (error) throw error;

      await supabase.from('movimientos').insert([
        {
          usuario_id: user?.id || 'sistema',
          accion: `Eliminó el curso táctico "${nombreCurso}"`,
          tipo: 'curso'
        }
      ]).catch(() => {});

      cargarCursos();
      showToast(`¡Curso eliminado correctamente!`);
    } catch (err) {
      console.error('Error al eliminar curso:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* NOTIFICACIÓN FLOTANTE (TOAST) */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0d172e] border border-emerald-500/50 text-emerald-400 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-bounce" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-100">{notification}</span>
        </div>
      )}

      {/* CABECERA DEL MÓDULO */}
      <div className="bg-[#0d172e] border border-[#1b315e] rounded-2xl p-6 flex justify-between items-center shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#13203c] border border-[#223966] rounded-xl flex items-center justify-center text-slate-300">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase text-white tracking-wider">Módulo de Cursos de Formación</h2>
            <p className="text-xs text-slate-400 font-semibold">Catálogo oficial de capacitaciones tácticas de la unidad</p>
          </div>
        </div>

        {/* BOTÓN NUEVO CURSO (Solo visible para Developer, Admin y Auxiliar) */}
        {puedeGestionarCursos && (
          <button
            onClick={abrirModalCrear}
            className="flex items-center space-x-2 px-5 py-3 bg-[#13203c] hover:bg-[#1b315e] border border-[#223966] hover:border-slate-500 text-slate-200 hover:text-white text-xs font-black uppercase rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-300" />
            <span>Nuevo Curso</span>
          </button>
        )}
      </div>

      {/* GRILLA DE CURSOS */}
      {loading ? (
        <div className="bg-[#0d172e] border border-[#1b315e] rounded-2xl p-8 text-center text-xs text-slate-400">
          Cargando capacitaciones del sistema...
        </div>
      ) : cursos.length === 0 ? (
        <div className="bg-[#0d172e] border border-[#1b315e] rounded-2xl p-12 text-center space-y-3 shadow-xl">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">No hay cursos registrados en la base de datos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso) => (
            <div 
              key={curso.id}
              className="bg-[#0d172e] border border-[#1b315e] hover:border-slate-500 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-30 h-30 bg-[#13203c]/50 border border-[#223966] rounded-xl overflow-hidden p-1.5 flex items-center justify-center shadow-inner">
                    <img 
                      src={curso.imagen || '/logo.jpg'} 
                      alt={curso.nombre} 
                      className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                      onError={(e) => { e.target.src = '/logo.jpg'; }}
                    />
                  </div>

                  {/* BOTONES DE EDICIÓN Y ELIMINACIÓN (Solo para roles con permisos) */}
                  {puedeGestionarCursos && (
                    <div className="flex items-center space-x-1.5">
                      <button 
                        onClick={() => abrirModalEditar(curso)}
                        title="Editar curso"
                        className="w-8 h-8 bg-[#13203c] hover:bg-[#1b315e] border border-[#223966] hover:border-slate-400 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleEliminarCurso(curso.id, curso.nombre)}
                        title="Eliminar curso"
                        className="w-8 h-8 bg-[#13203c] hover:bg-red-950/40 border border-[#223966] hover:border-red-500/50 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-black uppercase text-white tracking-wide mb-1 group-hover:text-slate-200 transition-colors">
                  {curso.nombre}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {curso.descripcion || 'Sin descripción asignada para este curso táctico.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#1b315e] flex justify-between items-center text-[10px] text-slate-500 uppercase font-black">
                <span>ID: #{curso.id}</span>
                <span className="text-slate-400">SWAT Elite</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL PARA CREAR O EDITAR UN CURSO */}
      {showModal && puedeGestionarCursos && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d172e] border border-[#223d73] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-fade-in">
            
            <div className="flex justify-between items-center border-b border-[#1b315e] pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>{isEditing ? 'Editar Curso Táctico' : 'Registrar Nuevo Curso Táctico'}</span>
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarCurso} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Nombre del Curso</label>
                <input 
                  type="text" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Brecheo de Puertas y CQC"
                  required
                  className="w-full bg-[#13203c] border border-[#223966] focus:border-slate-500 rounded-xl p-3 text-xs text-white outline-none shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Definición / Descripción</label>
                <textarea 
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción detallada de la capacitación..."
                  rows={3}
                  className="w-full bg-[#13203c] border border-[#223966] focus:border-slate-500 rounded-xl p-3 text-xs text-white outline-none resize-none shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Logo del Curso (PNG Transparente)</label>
                <div className="flex items-center space-x-4">
                  <label className="flex-1 cursor-pointer bg-[#13203c] hover:bg-[#18284b] border border-[#223966] rounded-xl px-4 py-3 flex items-center justify-center space-x-2 text-xs font-bold text-slate-300 transition-all shadow-inner">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <span>Seleccionar Logo...</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="hidden" 
                    />
                  </label>

                  {previewImg && (
                    <div className="w-12 h-12 rounded-xl border border-slate-500 overflow-hidden bg-[#13203c]/50 p-1 flex-shrink-0 shadow-lg flex items-center justify-center">
                      <img src={previewImg} alt="Preview" className="w-full h-full object-contain filter drop-shadow" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-[#13203c] hover:bg-[#18284b] border border-[#223966] rounded-xl text-xs font-bold text-slate-400 uppercase transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1b315e] hover:bg-[#223d73] border border-slate-600 text-white rounded-xl text-xs font-black uppercase shadow-lg transition-all cursor-pointer"
                >
                  {isEditing ? 'Actualizar Curso' : 'Guardar Curso'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}