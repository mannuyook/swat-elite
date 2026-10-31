import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import { Cursos } from './components/Cursos';
import { Medallas } from './components/Medallas';
import { Movimientos } from './components/Movimientos';
import { Roster } from './components/Roster';
import { Macros } from './components/Macros';
import { Bell, LogOut, ShieldCheck, User as UserIcon, Key, UserPlus, Hash, Shield } from 'lucide-react';

export function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('cursos');
  const [authView, setAuthView] = useState('login'); // 'login' o 'register'

  // Estados para el formulario de Login
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Estados para el formulario de Registro de Nuevo Agente
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRango, setRegRango] = useState('Recluta');
  const [regPlaca, setRegPlaca] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [loadingReg, setLoadingReg] = useState(false);

  // Al cargar la app, verificar si ya hay una sesión guardada en localStorage
  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      const rol = (savedUser.rol || 'miembro').toLowerCase();
      if (activeTab === 'movimientos' && rol === 'miembro') {
        setActiveTab('cursos');
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoadingLogin(true);

    try {
      const res = await authService.login(usernameInput, passwordInput);
      if (res.success) {
        setUser(res.user);
        const rol = (res.user.rol || 'miembro').toLowerCase();
        if (rol === 'miembro') {
          setActiveTab('cursos');
        }
      } else {
        setLoginError(res.error || 'Credenciales inválidas.');
      }
    } catch (err) {
      setLoginError('Error al intentar iniciar sesión.');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setLoadingReg(true);

    try {
      const nuevoAgente = {
        id: `swat_${Date.now()}`,
        username: regUsername,
        password: regPassword,
        rango: regRango,
        rol: 'miembro',
        placa: regPlaca ? parseInt(regPlaca) : null,
        avatar_base64: null
      };

      const res = await authService.register(nuevoAgente);
      if (res.success) {
        setRegSuccess('¡Agente registrado exitosamente! Ya puede iniciar sesión.');
        setRegUsername('');
        setRegPassword('');
        setRegPlaca('');
        setRegRango('Recluta');
        setTimeout(() => setAuthView('login'), 2000);
      } else {
        setRegError(res.error || 'Error al registrar el agente.');
      }
    } catch (err) {
      setRegError('Error al procesar el registro.');
    } finally {
      setLoadingReg(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setUsernameInput('');
    setPasswordInput('');
  };

  // Validar si el usuario actual tiene permisos para ver movimientos (Auxiliar, Admin, Developer)
  const rolUser = user?.rol ? user.rol.toLowerCase() : '';
  const puedeVerMovimientos = rolUser === 'developer' || rolUser === 'administrador' || rolUser === 'auxiliar';

  // ==========================================
  // PANTALLA DE ACCESO (LOGIN / REGISTRO)
  // ==========================================
  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#070e1b] text-white font-sans p-4 overflow-y-auto">
        <div className="w-full max-w-md bg-[#0d172e] border border-[#1b315e] rounded-2xl p-8 shadow-2xl space-y-6 my-auto">
          
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-[#13203c] border border-[#223966] overflow-hidden flex items-center justify-center shadow-xl">
              <img 
                src="/logo.jpg" 
                alt="SWAT Elite Logo" 
                className="w-full h-full object-cover rounded-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
                onError={(e) => { e.target.src = '/logo.jpg'; }}
              />
            </div>
            <div>
              <h1 className="text-base font-black uppercase tracking-wider text-white">SWAT ELITE LINCOLN</h1>
              <p className="text-xs text-slate-400 font-semibold mt-1">Portal de Acceso Restringido</p>
            </div>
          </div>

          {/* PESTAÑAS DE NAVEGACIÓN LOGIN / REGISTRO */}
          <div className="grid grid-cols-2 gap-2 bg-[#13203c] p-1 rounded-xl border border-[#223966]">
            <button
              onClick={() => { setAuthView('login'); setLoginError(''); }}
              className={`py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${authView === 'login' ? 'bg-[#334155] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setAuthView('register'); setRegError(''); setRegSuccess(''); }}
              className={`py-2 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${authView === 'register' ? 'bg-[#334155] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Registrar Agente
            </button>
          </div>

          {/* VISTA DE INICIO DE SESIÓN */}
          {authView === 'login' ? (
            <div className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-red-300 text-xs text-center font-bold">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Usuario / Agente</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input 
                      type="text"
                      required
                      placeholder="Ingrese su nombre de usuario"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full bg-[#13203c] border border-[#223966] focus:border-amber-500/60 rounded-xl pl-9 pr-4 py-3 text-xs text-white outline-none shadow-inner transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Contraseña</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-[#13203c] border border-[#223966] focus:border-amber-500/60 rounded-xl pl-9 pr-4 py-3 text-xs text-white outline-none shadow-inner transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loadingLogin}
                  className="w-full py-3 bg-[#334155] hover:bg-[#475569] border border-[#475569] rounded-xl text-xs font-black uppercase text-white tracking-wider shadow-lg transition-all cursor-pointer mt-2"
                >
                  {loadingLogin ? 'Verificando credenciales...' : 'Iniciar Sesión'}
                </button>
              </form>
            </div>
          ) : (
            /* VISTA DE REGISTRO DE NUEVO AGENTE */
            <div className="space-y-4">
              {regError && (
                <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-red-300 text-xs text-center font-bold">
                  {regError}
                </div>
              )}
              {regSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs text-center font-bold">
                  {regSuccess}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nombre de Agente</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Naranjo"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full bg-[#13203c] border border-[#223966] focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none shadow-inner transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Contraseña</label>
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-[#13203c] border border-[#223966] focus:border-amber-500/60 rounded-xl px-4 py-2.5 text-xs text-white outline-none shadow-inner transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Rango Inicial</label>
                    <select
                      value={regRango}
                      onChange={(e) => setRegRango(e.target.value)}
                      className="w-full bg-[#13203c] border border-[#223966] focus:border-amber-500/60 rounded-xl px-3 py-2.5 text-xs text-white outline-none shadow-inner cursor-pointer font-bold"
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

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nº Placa (1-500)</label>
                    <input 
                      type="number"
                      min="1"
                      max="500"
                      placeholder="Ej. 33"
                      value={regPlaca}
                      onChange={(e) => setRegPlaca(e.target.value)}
                      className="w-full bg-[#13203c] border border-[#223966] focus:border-amber-500/60 rounded-xl px-3 py-2.5 text-xs text-white outline-none shadow-inner"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loadingReg}
                  className="w-full py-3 bg-[#334155] hover:bg-[#475569] border border-[#475569] rounded-xl text-xs font-black uppercase text-white tracking-wider shadow-lg transition-all cursor-pointer mt-2 flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loadingReg ? 'Registrando en Base de Datos...' : 'Registrar Nuevo Agente'}</span>
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    );
  }

  // ==========================================
  // SI HAY SESIÓN ACTIVA, MOSTRAR PANEL TÁCTICO
  // ==========================================
  return (
    <div className="flex h-screen bg-[#070e1b] text-white font-sans overflow-hidden">
      
      {/* MENÚ LATERAL DE NAVEGACIÓN TÁCTICA */}
      <aside className="w-64 bg-[#0d172e] border-r border-[#1b315e] p-5 flex flex-col justify-between shadow-2xl flex-shrink-0">
        <div className="space-y-6">
          
          {/* LOGOTIPO / CABECERA CENTRADA */}
          <div className="flex flex-col items-center text-center p-2 space-y-3 border-b border-[#1b315e] pb-6">
            <div className="w-20 h-20 rounded-full bg-[#13203c]/60 border border-[#223966] overflow-hidden flex items-center justify-center shadow-xl">
              <img 
                src="/logo.jpg" 
                alt="SWAT Elite Logo" 
                className="w-full h-full object-cover rounded-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
                onError={(e) => { e.target.src = '/logo.jpg'; }}
              />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-white">SWAT ELITE</h1>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Lincoln</p>
            </div>
          </div>

          {/* NAVEGACIÓN */}
          <div className="space-y-2">
            <p className="px-2 text-[10px] font-black uppercase text-slate-500 tracking-wider">Navegación</p>
            <nav className="space-y-1">
              
              {/* Botón Movimientos (Solo visible para Auxiliar, Admin y Developer) */}
              {puedeVerMovimientos && (
                <button 
                  onClick={() => setActiveTab('movimientos')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center space-x-3 cursor-pointer ${activeTab === 'movimientos' ? 'bg-[#334155] text-white border border-[#475569] shadow-lg' : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'}`}
                >
                  <span>Movimientos</span>
                </button>
              )}

              <button 
                onClick={() => setActiveTab('cursos')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center space-x-3 cursor-pointer ${activeTab === 'cursos' ? 'bg-[#334155] text-white border border-[#475569] shadow-lg' : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'}`}
              >
                <span>Cursos</span>
              </button>

              <button 
                onClick={() => setActiveTab('medallas')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center space-x-3 cursor-pointer ${activeTab === 'medallas' ? 'bg-[#334155] text-white border border-[#475569] shadow-lg' : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'}`}
              >
                <span>Medallas</span>
              </button>

              <button 
                onClick={() => setActiveTab('miembros')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center space-x-3 cursor-pointer ${activeTab === 'miembros' ? 'bg-[#334155] text-white border border-[#475569] shadow-lg' : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'}`}
              >
                <span>Lista de Miembros</span>
              </button>

              <button 
                onClick={() => setActiveTab('macros')}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center space-x-3 cursor-pointer ${activeTab === 'macros' ? 'bg-[#334155] text-white border border-[#475569] shadow-lg' : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'}`}
              >
                <span>Macros</span>
              </button>
            </nav>
          </div>

        </div>

        {/* PIE DE BARRA LATERAL (PERFIL DE USUARIO LOGUEADO) */}
        <div className="pt-4 border-t border-[#1b315e] px-2 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-[#1e293b] border border-[#334155] flex items-center justify-center text-xs font-black text-slate-200 shadow-inner flex-shrink-0">
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate">{user.username}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide truncate">{user.rol || 'Miembro'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENEDOR DERECHO (BARRA SUPERIOR + CONTENIDO) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#070e1b]">
        
        {/* BARRA SUPERIOR */}
        <header className="h-20 bg-[#1e293b]/90 backdrop-blur-md border-b border-[#334155] px-8 flex justify-between items-center shadow-md flex-shrink-0">
          <div className="text-xs font-black uppercase tracking-wider text-slate-200">
            Panel de Control Táctico — Conectado como: <span className="text-amber-400">{user.username} ({user.rol})</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Botón de Notificaciones */}
            <button className="flex items-center space-x-2 px-4 py-2.5 bg-[#334155] hover:bg-[#475569] border border-amber-500/50 rounded-xl text-xs font-black uppercase text-amber-400 shadow-lg transition-all cursor-pointer">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Notificaciones</span>
            </button>

            {/* Botón Cerrar Sesión Real */}
            <button 
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="flex items-center space-x-2 px-4 py-2.5 bg-red-950/60 hover:bg-red-900/80 border border-red-500/60 text-red-400 hover:text-red-300 rounded-xl text-xs font-black uppercase shadow-lg transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </header>

        {/* ÁREA DE CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'cursos' && <Cursos user={user} />}
            {activeTab === 'medallas' && <Medallas user={user} />}
            {activeTab === 'movimientos' && puedeVerMovimientos && <Movimientos user={user} />}
            {activeTab === 'miembros' && <Roster user={user} />}
            {activeTab === 'macros' && <Macros />}
          </div>
        </main>

      </div>

    </div>
  );
}

export default App;