/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { User } from '../types';
import { addAuditLog } from '../utils/audit';

export interface AppUser extends User {
  password: string;
  status: 'active' | 'inactive';
}

interface AuthContextType {
  user: User | null;
  users: AppUser[];
  login: (username: string, password?: string) => void;
  logout: () => void;
  addUser: (data: Omit<AppUser, 'id'>) => void;
  updateUser: (id: string, updates: Partial<Pick<AppUser, 'name' | 'username'>>) => void;
  resetPassword: (id: string, newPassword: string) => void;
  toggleUserStatus: (id: string) => void;
  deleteUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_ID = 'u1';

const DEFAULT_USERS: AppUser[] = [
  { id: 'u1', username: 'admin', name: 'Administrador Geral', role: 'admin', password: '123456', status: 'active' },
  { id: 'u2', username: 'vendedor-ana', name: 'Ana Lima', role: 'vendor', password: '123', status: 'active' },
  { id: 'u3', username: 'vendedor-carlos', name: 'Carlos Melo', role: 'vendor', password: '123', status: 'active' },
  { id: 'u4', username: 'vendedor-roberto', name: 'Roberto Alves', role: 'vendor', password: '123', status: 'active' },
  { id: 'u5', username: 'vendedor-juliana', name: 'Juliana Pires', role: 'vendor', password: '123', status: 'active' },
  { id: 'u6', username: 'vendedor-fernanda', name: 'Fernanda Costa', role: 'vendor', password: '123', status: 'active' },
];

const loadUsers = (): AppUser[] => {
  try {
    const saved = localStorage.getItem('veiga-users-v1');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  localStorage.setItem('veiga-users-v1', JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
};

const saveUsers = (users: AppUser[]) => {
  localStorage.setItem('veiga-users-v1', JSON.stringify(users));
};

// Export a getter so other components can read current users from storage
export const getStoredUsers = (): AppUser[] => loadUsers();

// Keep backward-compatible MOCK_USERS export (always reads from storage)
export const MOCK_USERS: AppUser[] = loadUsers();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AppUser[]>(loadUsers);
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('veiga-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const persistUsers = useCallback((updated: AppUser[]) => {
    setUsers(updated);
    saveUsers(updated);
  }, []);

  const login = (username: string, password?: string) => {
    const currentUsers = loadUsers();
    const foundUser = currentUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!foundUser) throw new Error('Usuário não encontrado.');
    if (foundUser.status === 'inactive') throw new Error('Usuário inativo. Contate o administrador.');
    if (password && foundUser.password !== password) throw new Error('Senha incorreta.');

    const userWithoutPass = {
      id: foundUser.id,
      username: foundUser.username,
      name: foundUser.name,
      role: foundUser.role,
    };
    setUser(userWithoutPass);
    localStorage.setItem('veiga-user', JSON.stringify(userWithoutPass));
    addAuditLog(userWithoutPass.name, 'Login efetuado', 'Sessão iniciada via Painel', 'auth');
  };

  const logout = () => {
    if (user) {
      addAuditLog(user.name, 'Logout efetuado', 'Sessão encerrada', 'auth');
    }
    setUser(null);
    localStorage.removeItem('veiga-user');
  };

  const addUser = (data: Omit<AppUser, 'id'>) => {
    const newId = `u${Date.now()}`;
    const newUser: AppUser = { ...data, id: newId };
    const updated = [...users, newUser];
    persistUsers(updated);
    addAuditLog(user?.name || 'Administrador', 'Novo usuário criado', `${data.name} (${data.username})`, 'create');
  };

  const updateUser = (id: string, updates: Partial<Pick<AppUser, 'name' | 'username'>>) => {
    if (id === ADMIN_ID) return; // Admin is immutable
    const target = users.find(u => u.id === id);
    const updated = users.map(u => u.id === id ? { ...u, ...updates } : u);
    persistUsers(updated);
    addAuditLog(user?.name || 'Administrador', 'Usuário atualizado', `${target?.name || ''} → ${updates.name || ''}`, 'edit');
  };

  const resetPassword = (id: string, newPassword: string) => {
    if (id === ADMIN_ID) return; // Admin password immutable via UI
    const target = users.find(u => u.id === id);
    const updated = users.map(u => u.id === id ? { ...u, password: newPassword } : u);
    persistUsers(updated);
    addAuditLog(user?.name || 'Administrador', 'Senha alterada', `Senha de ${target?.name || ''} redefinida`, 'edit');
  };

  const toggleUserStatus = (id: string) => {
    if (id === ADMIN_ID) return; // Admin always active
    const target = users.find(u => u.id === id);
    const newStatus = target?.status === 'active' ? 'inactive' : 'active';
    const updated = users.map(u =>
      u.id === id ? { ...u, status: (u.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive' } : u
    );
    persistUsers(updated);
    addAuditLog(user?.name || 'Administrador', 'Status do usuário alterado', `${target?.name || ''} → ${newStatus === 'active' ? 'Ativo' : 'Inativo'}`, 'edit');
  };

  const deleteUser = (id: string) => {
    if (id === ADMIN_ID) return; // Admin is immortal
    const target = users.find(u => u.id === id);
    const updated = users.filter(u => u.id !== id);
    persistUsers(updated);
    addAuditLog(user?.name || 'Administrador', 'Usuário excluído', `${target?.name || ''}`, 'delete');
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addUser, updateUser, resetPassword, toggleUserStatus, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
