import { supabase } from '../supabaseClient';
import bcrypt from 'bcryptjs';

// Servicio de Autenticación y Gestión Táctica con Supabase

export const authService = {
  // Iniciar sesión
  async login(username, password) {
    try {
      // 1. Buscar al usuario por su username en la tabla 'usuarios'
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !usuarios) {
        throw new Error('Usuario no encontrado o credenciales inválidas.');
      }

      // 2. Verificar contraseña con bcrypt
      const validPassword = await bcrypt.compare(password, usuarios.password);
      if (!validPassword) {
        throw new Error('Contraseña incorrecta.');
      }

      // 3. Guardar sesión localmente en el navegador
      localStorage.setItem('swat_user', JSON.stringify(usuarios));
      return { success: true, user: usuarios };
    } catch (error) {
      console.error('Error en login:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Registrar un nuevo usuario / agente
  async register(userData) {
    try {
      // 1. Encriptar contraseña antes de guardarla
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // 2. Insertar en la tabla 'usuarios' de Supabase
      const { data, error } = await supabase
        .from('usuarios')
        .insert([
          {
            id: userData.id || `swat_${Date.now()}`,
            username: userData.username,
            password: hashedPassword,
            rango: userData.rango || 'Recluta',
            rol: userData.rol || 'miembro',
            placa: userData.placa || null,
            avatar_base64: userData.avatar_base64 || null
          }
        ])
        .select();

      if (error) throw error;

      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error en registro:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Obtener todos los usuarios de la base de datos (para el Roster)
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*');

      if (error) throw error;

      return { success: true, users: data || [] };
    } catch (error) {
      console.error('Error al obtener usuarios:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Actualizar datos administrativos de un agente (Rol, Rango, Placa)
  async updateUserAdmin(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', userId)
        .select();

      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('Error al actualizar agente:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Cambiar / resetear contraseña de un agente por parte de administración
  async changeUserPassword(userId, newPassword) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const { error } = await supabase
        .from('usuarios')
        .update({ password: hashedPassword })
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error al cambiar contraseña:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Eliminar / dar de baja un agente de la base de datos
  async deleteUser(userId) {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar usuario:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Obtener usuario actual desde el localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('swat_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Cerrar sesión
  logout() {
    localStorage.removeItem('swat_user');
  }
};