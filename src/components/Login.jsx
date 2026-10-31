import React, { useState } from 'react';
import { authService } from '../services/authService';
import { Lock, User, Image, ArrowRight } from 'lucide-react';

export function Login({ onLoginSuccess }) {
  // Estado para alternar entre el formulario de Login y Registro
  const [isRegistering, setIsRegistering] = useState(false);

  // Estados para capturar los datos de los formularios
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rango, setRango] = useState('Oficial');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // =========================================================================
  // FUNCIÓN PARA CONVERTIR LA IMAGEN DE AVATAR A BASE64
  // =========================================================================
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('La imagen de perfil no debe superar los 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // =========================================================================
  // MANEJO DEL ENVÍO DEL FORMULARIO (LOGIN / REGISTRO)
  // =========================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        // Registrar el usuario enviando los campos requeridos por la tabla 'usuarios'
        const regResult = await authService.register({
          username,
          password,
          rango,
          rol: 'miembro',
          avatar_base64: avatarBase64,
        });

        if (!regResult.success) {
          throw new Error(regResult.error || 'Error al registrar el agente.');
        }

        // 2. Una vez registrado con éxito, iniciar sesión automáticamente
        const loginData = await authService.login(username, password);
        if (!loginData.success) {
          throw new Error(loginData.error || 'Registro exitoso, pero falló el inicio de sesión automático.');
        }

        if (onLoginSuccess) onLoginSuccess(loginData.user);
      } else {
        // Iniciar sesión normal
        const loginData = await authService.login(username, password);
        if (!loginData.success) {
          throw new Error(loginData.error || 'Credenciales incorrectas o usuario no encontrado.');
        }

        if (onLoginSuccess) onLoginSuccess(loginData.user);
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 
      =========================================================================
      CONTENEDOR PRINCIPAL CON LA IMAGEN DE FONDO Y CAPA OSCURA
      =========================================================================
      * AQUÍ ESTÁ EL CAMBIO DEL FONDO:
      - bg-cover bg-center: Ajusta la imagen para que cubra toda la pantalla de forma perfecta.
      - backgroundImage: Aquí es donde apunta a tu imagen dentro de la carpeta public.
    */
    <div 
      className="min-h-screen flex flex-col justify-between bg-cover bg-center px-4 py-6 font-sans relative"
      style={{ backgroundImage: "url('/fondo-login.png')" }}
    >
      
      {/* CAPA OSCURA / SOMBRA (OVERLAY): Oscurece la imagen de fondo para que la tarjeta resalte y sea legible */}
      <div className="absolute inset-0 bg-[#0a152d]/75 backdrop-blur-[2px] pointer-events-none"></div>

      {/* ESPACIADOR SUPERIOR VACÍO PARA EQUILIBRAR */}
      <div className="hidden sm:block relative z-10"></div>

      {/* TARJETA DEL PORTAL (CENTRADA) */}
      <div className="w-full max-w-lg mx-auto bg-[#112347]/95 border border-[#1e3a70] rounded-xl shadow-2xl p-6 sm:p-8 relative z-10 overflow-hidden">
        
        {/* LÍNEA DECORATIVA SUPERIOR */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#112347] via-[#2a4d8c] to-[#112347]"></div>

        {/* ZONA DEL LOGO Y TÍTULOS */}
        <div className="flex flex-col items-center text-center p-2 space-y-3 border-b border-[#1b315e] pb-6">
          <div className="w-60 h-60 rounded-full bg-[#13203c]/60 border border-[#223966] overflow-hidden flex items-center justify-center shadow-xl">
            <img 
              src="/logo.jpg" 
              alt="SWAT Elite Logo" 
              className="w-full h-full object-cover rounded-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
              onError={(e) => { e.target.src = '/logo.jpg'; }}
            />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-wider text-slate-100 uppercase">
              SWAT ELITE
            </h1>
            <p className="text-xs font-semibold tracking-widest text-[#94a3b8] uppercase mt-1">
              Sistema Central de Operaciones
            </p>
          </div>
        </div>

        {/* MENSAJE DE ERROR */}
        {error && (
          <div className="mb-6 p-3 bg-red-900/40 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        {/* FORMULARIO DE INGRESO / REGISTRO */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* CAMPO: USUARIO */}
          <div>
            <label className="block text-xs font-bold text-[#cbd5e1] uppercase tracking-wider mb-2">
              Nombre de Usuario
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#94a3b8]">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. Agente_Lincoln"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a152d] border border-[#2a4d8c] rounded-lg text-slate-100 text-sm placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
              />
            </div>
          </div>

          {/* CAMPO: CONTRASEÑA */}
          <div>
            <label className="block text-xs font-bold text-[#cbd5e1] uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#94a3b8]">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a152d] border border-[#2a4d8c] rounded-lg text-slate-100 text-sm placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
              />
            </div>
          </div>

          {/* CAMPOS ADICIONALES PARA REGISTRO */}
          {isRegistering && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#cbd5e1] uppercase tracking-wider mb-2">
                  Rango de la Unidad
                </label>
                <select
                  value={rango}
                  onChange={(e) => setRango(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0a152d] border border-[#2a4d8c] rounded-lg text-slate-100 text-sm focus:outline-none focus:border-[#3b82f6] transition-all"
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

              <div>
                <label className="block text-xs font-bold text-[#cbd5e1] uppercase tracking-wider mb-2">
                  Foto de Perfil / Placa (Opcional)
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex-1 flex items-center justify-center px-4 py-2 bg-[#0a152d] border border-[#2a4d8c] rounded-lg text-xs font-medium text-[#cbd5e1] cursor-pointer hover:bg-[#142850] transition-colors">
                    <Image className="w-4 h-4 mr-2 text-[#94a3b8]" />
                    {avatarBase64 ? 'Imagen Seleccionada' : 'Seleccionar Imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {avatarBase64 && (
                    <img
                      src={avatarBase64}
                      alt="Vista previa"
                      className="w-9 h-9 rounded-full object-cover border border-[#3b82f6]"
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {/* BOTÓN PRINCIPAL */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-[#112347] hover:bg-[#1a3469] border border-[#2a4d8c] rounded-lg font-bold text-slate-200 tracking-wider uppercase text-sm shadow-lg shadow-black/40 flex items-center justify-center transition-all duration-200 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Procesando...</span>
            ) : (
              <>
                <span>{isRegistering ? 'Registrar Agente' : 'Acceder al Sistema'}</span>
                <ArrowRight className="w-4 h-4 ml-2 text-[#94a3b8]" />
              </>
            )}
          </button>
        </form>

        {/* TOGGLE MODO LOGIN / REGISTRO */}
        <div className="mt-6 text-center border-t border-[#1e3a70] pt-4">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="text-xs text-[#94a3b8] hover:text-slate-100 transition-colors font-medium underline uppercase tracking-wider"
          >
            {isRegistering
              ? '¿Ya tienes credenciales? Inicia Sesión'
              : '¿Nuevo en la unidad? Solicitar Registro'}
          </button>
        </div>

      </div>

      {/* LÍNEA DE DERECHOS RESERVADOS (ABAJO DE TODO EN LA PÁGINA) */}
      <footer className="mt-8 text-center relative z-10">
        <p className="text-[11px] text-[#94a3b8] tracking-wide">
          {'©'} {new Date().getFullYear()} SWAT ELITE LINCOLN. Todos los derechos reservados.
        </p>
        <p className="text-[10px] text-[#64748b] mt-0.5">
          Sitio web desarrollado exclusivamente para el grupo de SWAT Elite Lincoln (sitio usado sin fines de lucro).
        </p>
      </footer>

    </div>
  );
}

export default Login;