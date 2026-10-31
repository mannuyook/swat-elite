import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../supabaseClient';
import { 
  ShieldCheck, User, Search, RefreshCw, Settings, Trash2, 
  Key, Save, X, ShieldAlert, Award, BookOpen, CheckCircle2, Shield, Eye 
} from 'lucide-react';

export function Roster({ user }) {
  const [agentes, setAgentes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRango, setFiltroRango] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal de edición (Admin)
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [editRol, setEditRol] = useState('');
  const [editRango, setEditRango] = useState('');
  const [editPlaca, setEditPlaca] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  // Modal de Hoja de Servicios / Vista Pública de Perfil
  const [viewProfileAgent, setViewProfileAgent] = useState(null);
  const [profileCursos, setProfileCursos] = useState([]);
  const [profileMedallas, setProfileMedallas] = useState([]);

  // Listas de cursos y medallas para asignación
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [medallasDisponibles, setMedallasDisponibles] = useState([]);
  const [cursosAgente, setCursosAgente] = useState([]);
  const [medallasAgente, setMedallasAgente] = useState([]);

  const currentUserRol = (user?.rol || 'miembro').toLowerCase();
  const isAdminOrDev = currentUserRol === 'developer' || currentUserRol === 'administrador';

  const cargarAgentes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authService.getAllUsers();
      if (res.success) {
        setAgentes(res.users);
      } else {
        throw new Error(res.error || 'Error al cargar personal');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar personal');
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogosYAsignaciones = async (agenteId) => {
    try {
      const { data: cursosData } = await supabase.from('cursos').select('*');
      const { data: medallasData } = await supabase.from('medallas').select('*');
      setCursosDisponibles(cursosData || []);
      setMedallasDisponibles(medallasData || []);

      const { data: cAgente } = await supabase
        .from('cursos_asignados')
        .select('*')
        .eq('usuario_id', String(agenteId));
      setCursosAgente(cAgente || []);

      const { data: mAgente } = await supabase
        .from('medallas_otorgadas')
        .select('*')
        .eq('usuario_id', String(agenteId));
      setMedallasAgente(mAgente || []);

    } catch (err) {
      console.error('Error al cargar condecoraciones y cursos:', err);
    }
  };

  const abrirPerfilPublico = async (agente) => {
    setViewProfileAgent(agente);
    setProfileCursos([]);
    setProfileMedallas([]);
    try {
      const { data: todosCursos } = await supabase.from('cursos').select('*');
      const { data: todasMedallas } = await supabase.from('medallas').select('*');

      const { data: cAgente } = await supabase
        .from('cursos_asignados')
        .select('*')
        .eq('usuario_id', String(agente.id));

      const { data: mAgente } = await supabase
        .from('medallas_otorgadas')
        .select('*')
        .eq('usuario_id', String(agente.id));

      const misCursos = (todosCursos || []).filter(c => (cAgente || []).some(ca => String(ca.curso_id) === String(c.id)));
      const misMedallas = (todasMedallas || []).filter(m => (mAgente || []).some(ma => String(ma.medalla_id) === String(m.id)));

      setProfileCursos(misCursos);
      setProfileMedallas(misMedallas);
    } catch (err) {
      console.error('Error al cargar perfil público:', err);
    }
  };

  useEffect(() => {
    cargarAgentes();
  }, []);

  const openEditModal = async (agente) => {
    setSelectedAgent(agente);
    setEditRol(agente.rol || 'miembro');
    setEditRango(agente.rango || 'Recluta');
    setEditPlaca(agente.placa || '');
    setNewPassword('');
    setActionMsg({ type: '', text: '' });
    await cargarCatalogosYAsignaciones(agente.id);
  };

  const targetRol = (selectedAgent?.rol || 'miembro').toLowerCase();
  
  const canChangePassword = 
    currentUserRol === 'developer' || 
    (currentUserRol === 'administrador' && targetRol !== 'administrador' && targetRol !== 'developer');

  const canEditDetails = currentUserRol === 'developer' || currentUserRol === 'administrador';
  const isAdminTargetRestricted = currentUserRol === 'administrador' && (targetRol === 'administrador' || targetRol === 'developer');

  const allowedRoleOptions = () => {
    if (currentUserRol === 'developer') {
      return (
        <>
          <option value="miembro">Miembro</option>
          <option value="auxiliar">Auxiliar</option>
          <option value="administrador">Administrador</option>
          <option value="developer">Developer</option>
        </>
      );
    } else {
      return (
        <>
          <option value="miembro">Miembro</option>
          <option value="auxiliar">Auxiliar</option>
        </>
      );
    }
  };

  const canDeleteUser = 
    currentUserRol === 'developer' || 
    (currentUserRol === 'administrador' && targetRol !== 'administrador' && targetRol !== 'developer');

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!selectedAgent) return;
    setActionLoading(true);
    setActionMsg({ type: '', text: '' });

    try {
      if (canEditDetails && !isAdminTargetRestricted) {
        const updates = {
          rol: editRol,
          rango: editRango,
          placa: editPlaca ? parseInt(editPlaca) : null
        };
        const resUpdate = await authService.updateUserAdmin(selectedAgent.id, updates);
        if (!resUpdate.success) throw new Error(resUpdate.error);

        await supabase.from('movimientos').insert([{
          usuario_responsable_id: user?.username || 'Sistema',
          accion: `${user?.username || 'Admin'} modificó el expediente de ${selectedAgent.username} (Rol: ${editRol}, Rango: ${editRango})`,
          tipo: 'ADMINISTRACIÓN'
        }]);
      }

      if (newPassword.trim() !== '') {
        if (!canChangePassword) {
          throw new Error('No tienes permisos para cambiar la contraseña de este agente.');
        }
        const resPass = await authService.changeUserPassword(selectedAgent.id, newPassword);
        if (!resPass.success) throw new Error(resPass.error);

        await supabase.from('movimientos').insert([{
          usuario_responsable_id: user?.username || 'Sistema',
          accion: `${user?.username || 'Admin'} reseteó la contraseña del agente ${selectedAgent.username}`,
          tipo: 'SEGURIDAD'
        }]);
      }

      setActionMsg({ type: 'success', text: '¡Expediente actualizado correctamente!' });
      await cargarAgentes();
      setTimeout(() => setSelectedAgent(null), 1500);

    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Error al guardar los cambios' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAsignarCurso = async (cursoId, cursoNombre) => {
    try {
      const yaLoTiene = cursosAgente.some(c => String(c.curso_id) === String(cursoId));
      if (yaLoTiene) {
        setActionMsg({ type: 'error', text: `El agente ya cuenta con el curso "${cursoNombre}".` });
        return;
      }

      const { error } = await supabase.from('cursos_asignados').insert([{
        usuario_id: String(selectedAgent.id),
        curso_id: String(cursoId)
      }]);
      if (error) throw error;

      await supabase.from('movimientos').insert([{
        usuario_responsable_id: user?.username || 'Sistema',
        accion: `${user?.username || 'Admin'} asignó el curso "${cursoNombre}" al agente ${selectedAgent.username}`,
        tipo: 'CURSO'
      }]);

      await cargarCatalogosYAsignaciones(selectedAgent.id);
      setActionMsg({ type: 'success', text: `¡Curso "${cursoNombre}" asignado con éxito!` });
    } catch (err) {
      console.error('Excepción al asignar curso:', err);
      setActionMsg({ type: 'error', text: 'Error al asignar el curso.' });
    }
  };

  const handleRemoverCurso = async (cursoId, cursoNombre) => {
    if (!isAdminOrDev) {
      setActionMsg({ type: 'error', text: 'No tienes permisos para retirar cursos.' });
      return;
    }

    try {
      const { error } = await supabase
        .from('cursos_asignados')
        .delete()
        .eq('usuario_id', String(selectedAgent.id))
        .eq('curso_id', String(cursoId));

      if (error) throw error;

      await supabase.from('movimientos').insert([{
        usuario_responsable_id: user?.username || 'Sistema',
        accion: `${user?.username || 'Admin'} retiró el curso "${cursoNombre}" al agente ${selectedAgent.username}`,
        tipo: 'CURSO'
      }]);

      await cargarCatalogosYAsignaciones(selectedAgent.id);
      setActionMsg({ type: 'success', text: `¡Curso "${cursoNombre}" retirado con éxito!` });
    } catch (err) {
      console.error('Excepción al remover curso:', err);
      setActionMsg({ type: 'error', text: 'Error al retirar el curso.' });
    }
  };

  const handleAsignarMedalla = async (medallaId, medallaNombre) => {
    try {
      const yaLaTiene = medallasAgente.some(m => String(m.medalla_id) === String(medallaId));
      if (yaLaTiene) {
        setActionMsg({ type: 'error', text: `El agente ya posee la medalla "${medallaNombre}".` });
        return;
      }

      const { error } = await supabase.from('medallas_otorgadas').insert([{
        usuario_id: String(selectedAgent.id),
        medalla_id: String(medallaId)
      }]);
      if (error) throw error;

      await supabase.from('movimientos').insert([{
        usuario_responsable_id: user?.username || 'Sistema',
        accion: `${user?.username || 'Admin'} otorgó la medalla "${medallaNombre}" al agente ${selectedAgent.username}`,
        tipo: 'MEDALLA'
      }]);

      await cargarCatalogosYAsignaciones(selectedAgent.id);
      setActionMsg({ type: 'success', text: `¡Medalla "${medallaNombre}" otorgada con éxito!` });
    } catch (err) {
      console.error('Excepción al otorgar medalla:', err);
      setActionMsg({ type: 'error', text: 'Error al otorgar la medalla.' });
    }
  };

  const handleRemoverMedalla = async (medallaId, medallaNombre) => {
    if (!isAdminOrDev) {
      setActionMsg({ type: 'error', text: 'No tienes permisos para retirar medallas.' });
      return;
    }

    try {
      const { error } = await supabase
        .from('medallas_otorgadas')
        .delete()
        .eq('usuario_id', String(selectedAgent.id))
        .eq('medalla_id', String(medallaId));

      if (error) throw error;

      await supabase.from('movimientos').insert([{
        usuario_responsable_id: user?.username || 'Sistema',
        accion: `${user?.username || 'Admin'} retiró la medalla "${medallaNombre}" al agente ${selectedAgent.username}`,
        tipo: 'MEDALLA'
      }]);

      await cargarCatalogosYAsignaciones(selectedAgent.id);
      setActionMsg({ type: 'success', text: `¡Medalla "${medallaNombre}" retirada con éxito!` });
    } catch (err) {
      console.error('Excepción al remover medalla:', err);
      setActionMsg({ type: 'error', text: 'Error al retirar la medalla.' });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedAgent || !canDeleteUser) return;
    if (!window.confirm(`¿Estás seguro de dar de baja / eliminar al agente ${selectedAgent.username}?`)) return;

    setActionLoading(true);
    try {
      const res = await authService.deleteUser(selectedAgent.id);
      if (res.success) {
        await supabase.from('movimientos').insert([{
          usuario_responsable_id: user?.username || 'Sistema',
          accion: `${user?.username || 'Admin'} dio de baja al agente ${selectedAgent.username}`,
          tipo: 'PERSONAL'
        }]);

        await cargarAgentes();
        setSelectedAgent(null);
      } else {
        throw new Error(res.error);
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Error al eliminar usuario' });
    } finally {
      setActionLoading(false);
    }
  };

  const agentesFiltrados = agentes.filter((agente) => {
    const coincideNombre = agente.username ? agente.username.toLowerCase().includes(busqueda.toLowerCase()) : false;
    const coincideRango = filtroRango === 'Todos' || agente.rango === filtroRango;
    return coincideNombre && coincideRango;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* CABECERA Y FILTROS */}
      <div className="bg-[#0d172e] border border-[#1b315e] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span>Roster Oficial de la Unidad</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            Personal activo registrado en el portal central SWAT Elite Lincoln. Haz clic en un agente para ver su hoja de servicios.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-48">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar agente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#13203c] border border-[#223966] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 shadow-inner"
            />
          </div>

          <select
            value={filtroRango}
            onChange={(e) => setFiltroRango(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 bg-[#13203c] border border-[#223966] rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500/60 shadow-inner cursor-pointer font-bold"
          >
            <option value="Todos">Todos los Rangos</option>
            <option value="Recluta">Recluta</option>
            <option value="Sargento">Sargento</option>
            <option value="Sargento Primero">Sargento Primero</option>
            <option value="Teniente">Teniente</option>
            <option value="Capitán">Capitán</option>
            <option value="Mayor">Mayor</option>
            <option value="Coronel">Coronel</option>
            <option value="Teniente General">Teniente General</option>
            <option value="Mayor General">Mayor General</option>
            <option value="General Adjunto">General Adjunto</option>
          </select>

          <button
            onClick={cargarAgentes}
            className="p-2.5 bg-[#13203c] border border-[#223966] hover:bg-[#1b315e] rounded-xl text-slate-300 transition-all cursor-pointer shadow-md"
            title="Actualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-500/60 rounded-xl text-red-300 text-xs text-center font-bold">
          {error}
        </div>
      )}

      {/* TABLA DE AGENTES */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-wider">
          Consultando base de datos táctica...
        </div>
      ) : agentesFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-[#0d172e] border border-[#1b315e] rounded-2xl text-slate-400 text-xs font-bold uppercase tracking-wider shadow-xl">
          No se encontraron agentes registrados.
        </div>
      ) : (
        <div className="bg-[#0d172e] border border-[#1b315e] rounded-2xl p-6 shadow-2xl space-y-3">
          
          <div className="hidden sm:grid grid-cols-12 gap-3 px-3 pb-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
            <div className="col-span-2">Avatar</div>
            <div className="col-span-3">Nombre y Apellido</div>
            <div className="col-span-2 text-center">Rango</div>
            <div className="col-span-2 text-center">Placa</div>
            <div className="col-span-2 text-center">Rol</div>
            <div className="col-span-1 text-center">Acción</div>
          </div>

          <div className="space-y-3">
            {agentesFiltrados.map((agente) => (
              <div 
                key={agente.id}
                className="grid grid-cols-12 gap-3 p-3 bg-[#0a1324] border border-[#1b315e] hover:border-slate-500 rounded-xl shadow-lg items-center transition-all group"
              >
                {/* AVATAR CUADRADO */}
                <div 
                  onClick={() => abrirPerfilPublico(agente)}
                  className="col-span-3 sm:col-span-2 bg-[#13203c] border border-[#223966] rounded-xl w-16 h-16 flex items-center justify-center overflow-hidden p-1.5 relative shadow-inner cursor-pointer hover:border-amber-400 transition-colors mx-auto"
                  title="Ver Hoja de Servicios"
                >
                  {agente.avatar_base64 ? (
                    <img src={agente.avatar_base64} alt={agente.username} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <User className="w-7 h-7 text-slate-400" />
                  )}
                  <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0a1324] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </div>

                {/* NOMBRE */}
                <div 
                  onClick={() => abrirPerfilPublico(agente)}
                  className="col-span-9 sm:col-span-3 bg-[#13203c] border border-[#223966] rounded-xl h-16 px-4 flex items-center shadow-inner cursor-pointer hover:border-amber-400 transition-colors"
                  title="Ver Hoja de Servicios"
                >
                  <span className="text-xs sm:text-sm font-black uppercase text-white tracking-wide truncate">
                    {agente.username || 'Sin Nombre'}
                  </span>
                </div>

                {/* RANGO */}
                <div className="col-span-4 sm:col-span-2 bg-[#13203c] border border-[#223966] rounded-xl h-16 px-3 flex items-center justify-center text-center shadow-inner">
                  <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-200 truncate">
                    {agente.rango || 'Recluta'}
                  </span>
                </div>

                {/* PLACA */}
                <div className="col-span-4 sm:col-span-2 bg-[#13203c] border border-[#223966] rounded-xl h-16 px-3 flex items-center justify-center text-center shadow-inner">
                  <span className="text-xs sm:text-sm font-mono font-black text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-lg">
                    #{agente.placa ? String(agente.placa).padStart(2, '0') : '00'}
                  </span>
                </div>

                {/* ROL */}
                <div className="col-span-4 sm:col-span-2 bg-[#13203c] border border-[#223966] rounded-xl h-16 px-3 flex items-center justify-center text-center shadow-inner">
                  <span className={`text-[11px] font-mono font-bold uppercase px-2 py-1 rounded-md border ${
                    agente.rol === 'developer' ? 'text-amber-400 border-amber-500/40 bg-amber-950/30' :
                    agente.rol === 'administrador' ? 'text-purple-400 border-purple-500/40 bg-purple-950/30' :
                    agente.rol === 'auxiliar' ? 'text-blue-400 border-blue-500/40 bg-blue-950/30' :
                    'text-slate-400 border-slate-700 bg-slate-900/40'
                  }`}>
                    {agente.rol || 'miembro'}
                  </span>
                </div>

                {/* ACCIÓN */}
                <div className="col-span-12 sm:col-span-1 flex justify-center items-center h-16 space-x-1">
                  <button
                    onClick={() => abrirPerfilPublico(agente)}
                    className="p-2.5 bg-[#13203c] hover:bg-[#1b315e] border border-[#223966] rounded-xl text-slate-300 hover:text-amber-400 transition-all cursor-pointer shadow-md"
                    title="Ver Perfil y Condecoraciones"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {currentUserRol !== 'miembro' ? (
                    <button
                      onClick={() => openEditModal(agente)}
                      className="p-2.5 bg-[#13203c] hover:bg-[#1b315e] border border-[#223966] rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
                      title="Editar / Gestión Táctica"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* MODAL 1: HOJA DE SERVICIOS / PERFIL PÚBLICO AMPLIADO */}
      {viewProfileAgent && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0d172e] border border-[#1b315e] rounded-2xl max-w-5xl w-full p-10 shadow-2xl space-y-6 relative my-auto animate-scale-in">
            
            <button 
              onClick={() => setViewProfileAgent(null)}
              className="absolute top-5 right-5 p-2 bg-[#13203c] text-slate-400 hover:text-white rounded-xl border border-[#223966] cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-5 border-b border-[#1b315e] pb-6">
              <div className="w-20 h-20 bg-[#13203c] border border-[#223966] rounded-2xl overflow-hidden flex items-center justify-center shadow-inner flex-shrink-0">
                {viewProfileAgent.avatar_base64 ? (
                  <img src={viewProfileAgent.avatar_base64} alt={viewProfileAgent.username} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-md">
                  Placa #{viewProfileAgent.placa ? String(viewProfileAgent.placa).padStart(2, '0') : '00'}
                </span>
                <h3 className="text-xl font-black uppercase text-white tracking-wide pt-1">{viewProfileAgent.username}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase">Rango: <span className="text-slate-200">{viewProfileAgent.rango || 'Recluta'}</span> | Rol: <span className="text-amber-400">{viewProfileAgent.rol || 'miembro'}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CURSOS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-slate-200 flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Cursos Tácticos Aprobados</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                    {profileCursos.length}
                  </span>
                </div>

                <div className="bg-[#070e1b] border border-[#1b315e] rounded-2xl p-4 h-96 overflow-y-auto space-y-3 shadow-inner">
                  {profileCursos.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                      <BookOpen className="w-8 h-8 text-slate-600" />
                      <p className="text-xs text-slate-500 italic">Este agente aún no cuenta con cursos tácticos registrados.</p>
                    </div>
                  ) : (
                    profileCursos.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-4 bg-[#0d172e] border border-[#1b315e] rounded-2xl shadow-md hover:border-slate-500 transition-all">
                        <div className="flex items-center space-x-4 overflow-hidden">
                          {c.imagen ? (
                            <img src={c.imagen} alt="" className="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-[#223966]" />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-[#13203c] border border-[#223966] flex items-center justify-center flex-shrink-0 text-amber-400 font-black text-sm">C</div>
                          )}
                          <div className="overflow-hidden">
                            <span className="text-xs font-black text-white uppercase tracking-wide block truncate">{c.nombre}</span>
                            <span className="text-[10px] text-slate-400 block truncate">Curso táctico oficial</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-600/40 px-3 py-1 rounded-xl flex-shrink-0 font-bold shadow-sm">
                          Aprobado
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* MEDALLAS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-slate-200 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Medallas y Condecoraciones</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                    {profileMedallas.length}
                  </span>
                </div>

                <div className="bg-[#070e1b] border border-[#1b315e] rounded-2xl p-4 h-96 overflow-y-auto space-y-3 shadow-inner">
                  {profileMedallas.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                      <Award className="w-12 h-12 text-slate-600" />
                      <p className="text-xs text-slate-500 italic">Este agente aún no ha recibido condecoraciones oficiales.</p>
                    </div>
                  ) : (
                    profileMedallas.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-4 bg-[#0d172e] border border-[#1b315e] rounded-2xl shadow-md hover:border-slate-500 transition-all">
                        <div className="flex items-center space-x-4 overflow-hidden">
                          {m.imagen ? (
                            <img src={m.imagen} alt="" className="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-[#223966]" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[#13203c] border border-[#223966] flex items-center justify-center flex-shrink-0 text-amber-400 font-black text-sm">M</div>
                          )}
                          <div className="overflow-hidden">
                            <span className="text-xs font-black text-white uppercase tracking-wide block truncate">{m.nombre}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{m.descripcion || 'Sin descripción'}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-600/40 px-3 py-1 rounded-xl flex-shrink-0 font-bold shadow-sm">
                          Otorgada
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <div className="pt-3">
              <button
                onClick={() => setViewProfileAgent(null)}
                className="w-full py-3.5 bg-[#334155] hover:bg-[#475569] border border-[#475569] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer"
              >
                Cerrar Hoja de Servicios
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: GESTIÓN DE AGENTE (ADMIN / DEVELOPER) */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0d172e] border border-[#1b315e] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative my-auto animate-scale-in">
            
            <button 
              onClick={() => setSelectedAgent(null)}
              className="absolute top-4 right-4 p-1.5 bg-[#13203c] text-slate-400 hover:text-white rounded-lg border border-[#223966] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 border-b border-[#1b315e] pb-4">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="text-sm font-black uppercase text-white">Gestión de Agente y Condecoraciones</h3>
                <p className="text-xs text-slate-400 font-bold">Modificando expediente de: <span className="text-amber-400">{selectedAgent.username}</span></p>
              </div>
            </div>

            {actionMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-bold text-center border ${
                actionMsg.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' : 'bg-red-950/80 border-red-500/60 text-red-300'
              }`}>
                {actionMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4">
              
              {isAdminTargetRestricted && currentUserRol === 'administrador' && (
                <div className="p-3 bg-amber-950/50 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold">
                  ⚠️ No tienes privilegios para modificar roles o credenciales de este usuario de alto rango.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Rol del Sistema</label>
                  <select
                    disabled={!canEditDetails || isAdminTargetRestricted}
                    value={editRol}
                    onChange={(e) => setEditRol(e.target.value)}
                    className="w-full bg-[#13203c] border border-[#223966] rounded-xl p-2.5 text-xs text-white outline-none font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {allowedRoleOptions()}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Rango Oficial</label>
                  <select
                    disabled={!canEditDetails || isAdminTargetRestricted}
                    value={editRango}
                    onChange={(e) => setEditRango(e.target.value)}
                    className="w-full bg-[#13203c] border border-[#223966] rounded-xl p-2.5 text-xs text-white outline-none font-bold disabled:opacity-50 cursor-pointer"
                  >
                    <option value="Recluta">Recluta</option>
                    <option value="Sargento">Sargento</option>
                    <option value="Sargento Primero">Sargento Primero</option>
                    <option value="Teniente">Teniente</option>
                    <option value="Capitán">Capitán</option>
                    <option value="Mayor">Mayor</option>
                    <option value="Coronel">Coronel</option>
                    <option value="Teniente General">Teniente General</option>
                    <option value="Mayor General">Mayor General</option>
                    <option value="General Adjunto">General Adjunto</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Número de Placa (1-999)</label>
                <input
                  type="number"
                  disabled={!canEditDetails || isAdminTargetRestricted}
                  value={editPlaca}
                  onChange={(e) => setEditPlaca(e.target.value)}
                  placeholder="Ej. 12"
                  className="w-full bg-[#13203c] border border-[#223966] rounded-xl p-2.5 text-xs text-white outline-none disabled:opacity-50"
                />
              </div>

              <div className="space-y-1 pt-2 border-t border-[#1b315e]">
                <label className="text-[10px] font-black uppercase text-amber-400 flex items-center space-x-1">
                  <Key className="w-3 h-3" />
                  <span>Resetear Contraseña</span>
                </label>
                <input
                  type="password"
                  disabled={!canChangePassword}
                  placeholder={canChangePassword ? "Nueva contraseña..." : "No autorizado para cambiar esta clave"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#13203c] border border-[#223966] rounded-xl p-2.5 text-xs text-white outline-none disabled:opacity-40"
                />
              </div>

              {/* SECCIÓN DE ASIGNACIÓN Y RETIRO DE CURSOS Y MEDALLAS */}
              <div className="space-y-4 pt-3 border-t border-[#1b315e]">
                
                {/* CURSOS */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-300 flex items-center space-x-1 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gestión de Cursos Tácticos</span>
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 bg-[#070e1b] rounded-xl border border-[#1b315e]">
                    {cursosDisponibles.map((curso) => {
                      const yaLoTiene = cursosAgente.some(c => String(c.curso_id) === String(curso.id));
                      return (
                        <div key={curso.id} className="flex items-center space-x-1">
                          {yaLoTiene ? (
                            isAdminOrDev ? (
                              <button
                                type="button"
                                onClick={() => handleRemoverCurso(curso.id, curso.nombre)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 bg-red-950/60 text-red-300 border border-red-600/50 hover:bg-red-900/80 transition-all cursor-pointer shadow-sm"
                                title="Clic para retirar este curso"
                              >
                                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                <span>{curso.nombre} (Quitar)</span>
                              </button>
                            ) : (
                              <div className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 bg-emerald-950/60 text-emerald-300 border border-emerald-600/50">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                <span>{curso.nombre} (Asignado)</span>
                              </div>
                            )
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAsignarCurso(curso.id, curso.nombre)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 bg-[#13203c] hover:bg-[#1b315e] text-slate-300 border border-[#223966] transition-all cursor-pointer"
                            >
                              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                              <span>{curso.nombre} (Asignar)</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* MEDALLAS */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-300 flex items-center space-x-1 mb-2">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gestión de Medallas y Condecoraciones</span>
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 bg-[#070e1b] rounded-xl border border-[#1b315e]">
                    {medallasDisponibles.map((medalla) => {
                      const yaLaTiene = medallasAgente.some(m => String(m.medalla_id) === String(medalla.id));
                      return (
                        <div key={medalla.id} className="flex items-center space-x-1">
                          {yaLaTiene ? (
                            isAdminOrDev ? (
                              <button
                                type="button"
                                onClick={() => handleRemoverMedalla(medalla.id, medalla.nombre)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 bg-red-950/60 text-red-300 border border-red-600/50 hover:bg-red-900/80 transition-all cursor-pointer shadow-sm"
                                title="Clic para retirar esta medalla"
                              >
                                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                <span>{medalla.nombre} (Quitar)</span>
                              </button>
                            ) : (
                              <div className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 bg-amber-950/60 text-amber-300 border border-amber-600/50">
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                <span>{medalla.nombre} (Otorgada)</span>
                              </div>
                            )
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAsignarMedalla(medalla.id, medalla.nombre)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 bg-[#13203c] hover:bg-[#1b315e] text-slate-300 border border-[#223966] transition-all cursor-pointer"
                            >
                              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                              <span>{medalla.nombre} (Otorgar)</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#1b315e]">
                {canDeleteUser ? (
                  <button
                    type="button"
                    onClick={handleDeleteUser}
                    disabled={actionLoading}
                    className="px-3 py-2 bg-red-950/60 hover:bg-red-900/80 border border-red-500/60 text-red-400 rounded-xl text-xs font-black uppercase flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Dar de Baja</span>
                  </button>
                ) : <div />}

                <button
                  type="submit"
                  disabled={actionLoading || isAdminTargetRestricted}
                  className="px-5 py-2.5 bg-[#334155] hover:bg-[#475569] border border-[#475569] text-white rounded-xl text-xs font-black uppercase flex items-center space-x-2 shadow-lg cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{actionLoading ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Roster;