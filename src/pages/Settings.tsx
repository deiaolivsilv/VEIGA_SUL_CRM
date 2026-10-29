import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Settings.module.css';
import {
  UserPlus, CheckCircle, AlertCircle, Edit2, KeyRound, X,
  Trash2, UserCog, Smartphone
} from 'lucide-react';

type UserModal = { mode: 'add' } | { mode: 'edit'; userId: string } | { mode: 'password'; userId: string } | null;

const Settings = () => {
  const { user, users, addUser, updateUser, resetPassword, deleteUser } = useAuth();
  const [userModal, setUserModal] = useState<UserModal>(null);
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirm, setFormConfirm] = useState('');
  const [formError, setFormError] = useState('');

  const openAdd = () => {
    setFormName(''); setFormUsername(''); setFormPassword(''); setFormConfirm(''); setFormError('');
    setUserModal({ mode: 'add' });
  };
  const openEdit = (userId: string) => {
    const u = users.find(u => u.id === userId);
    if (!u) return;
    setFormName(u.name); setFormUsername(u.username); setFormPassword(''); setFormConfirm(''); setFormError('');
    setUserModal({ mode: 'edit', userId });
  };
  const openPassword = (userId: string) => {
    setFormPassword(''); setFormConfirm(''); setFormError('');
    setUserModal({ mode: 'password', userId });
  };

  const handleAddUser = () => {
    if (!formName.trim() || !formUsername.trim() || !formPassword.trim()) { setFormError('Preencha todos os campos.'); return; }
    if (formPassword !== formConfirm) { setFormError('Senhas não coincidem.'); return; }
    if (users.find(u => u.username.toLowerCase() === formUsername.toLowerCase())) { setFormError('Login já existe.'); return; }
    addUser({ name: formName.trim(), username: formUsername.trim(), password: formPassword, role: 'vendor', status: 'active' });
    setUserModal(null);
  };

  const handleEditUser = (userId: string) => {
    if (!formName.trim() || !formUsername.trim()) { setFormError('Preencha todos os campos.'); return; }
    updateUser(userId, { name: formName.trim(), username: formUsername.trim() });
    setUserModal(null);
  };

  const handleResetPassword = (userId: string) => {
    if (!formPassword.trim()) { setFormError('Digite a nova senha.'); return; }
    if (formPassword !== formConfirm) { setFormError('Senhas não coincidem.'); return; }
    resetPassword(userId, formPassword);
    setUserModal(null);
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (window.confirm(`Confirmar exclusão de ${name}?`)) deleteUser(userId);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>Gerenciamento de Usuários</h1>
            <p className={styles.subtitle}>Gerencie os acessos e colaboradores da plataforma</p>
          </div>
          <div className={styles.controls}>
             {user?.role === 'admin' && (
                <button className={styles.addBtn} onClick={openAdd}>
                  <UserPlus size={18} /> Adicionar Usuário
                </button>
             )}
          </div>
        </div>
      </header>

      <div className={styles.layoutSingle}>
        <main className={styles.mainContent}>
          <div className={styles.viewContainer}>
            <div className={styles.card}>
              <div className={styles.userTable}>
                <div className={styles.userTableHeader}>
                  <span>Colaborador</span>
                  <span>Usuário</span>
                  <span style={{ textAlign: 'center' }}>Status</span>
                  <span style={{ textAlign: 'right' }}>Ações</span>
                </div>
                {users.filter(u => u.role !== 'admin').map(u => {
                  const isOnline = u.id === user?.id; 
                  return (
                    <div key={u.id} className={styles.userTableRow}>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>{u.name.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
                        <div className={styles.userMainInfo}>
                          <div className={styles.userName}>{u.name}</div>
                          <div className={styles.userRoleText}>Vendedor</div>
                        </div>
                      </div>
                      <span className={styles.userLogin}>{u.username}</span>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className={`${styles.statusPill} ${isOnline ? styles.online : styles.offline}`}>
                           <span className={styles.dot}></span>
                           {isOnline ? 'Online' : 'Offline'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className={styles.smBtn} onClick={() => openEdit(u.id)} title="Editar"><Edit2 size={13} /></button>
                        <button className={styles.smBtn} onClick={() => openPassword(u.id)} title="Senha"><KeyRound size={13} /></button>
                        <button className={`${styles.smBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteUser(u.id, u.name)} title="Excluir"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL */}
      {userModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button onClick={() => setUserModal(null)} className={styles.closeModal}><X size={18} /></button>
            <div className={styles.modalHeader}>
               <div className={styles.modalIconBox} style={{ color: userModal.mode === 'password' ? '#f59e0b' : 'var(--accent)', background: userModal.mode === 'password' ? 'rgba(245,158,11,0.1)' : 'rgba(113,188,83,0.1)' }}>
                 {userModal.mode === 'password' ? <KeyRound size={24} /> : <UserCog size={24} />}
               </div>
               <div className={styles.modalHeaderText}>
                 <h3 className={styles.modalTitle}>{userModal.mode === 'add' ? 'Novo Usuário' : userModal.mode === 'edit' ? 'Editar Perfil' : 'Alterar Senha'}</h3>
                 <p className={styles.modalSubtitle}>Siga as instruções para confirmar a ação</p>
               </div>
            </div>
            {formError && <div className={styles.formError}><AlertCircle size={16} />{formError}</div>}
            <div className={styles.formFields}>
              {(userModal.mode === 'add' || userModal.mode === 'edit') && (
                <>
                  <div className={styles.fieldGroup}><label>Nome</label><div className={styles.inputWrapper}><UserCog size={18} className={styles.fieldIcon} /><input value={formName} onChange={e => setFormName(e.target.value)} /></div></div>
                  <div className={styles.fieldGroup}><label>Login</label><div className={styles.inputWrapper}><Smartphone size={18} className={styles.fieldIcon} /><input value={formUsername} onChange={e => setFormUsername(e.target.value)} /></div></div>
                </>
              )}
              {(userModal.mode === 'add' || userModal.mode === 'password') && (
                <>
                  <div className={styles.fieldGroup}><label>Senha</label><div className={styles.inputWrapper}><KeyRound size={18} className={styles.fieldIcon} /><input type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} /></div></div>
                  <div className={styles.fieldGroup}><label>Confirmar</label><div className={styles.inputWrapper}><CheckCircle size={18} className={styles.fieldIcon} /><input type="password" value={formConfirm} onChange={e => setFormConfirm(e.target.value)} /></div></div>
                </>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setUserModal(null)} className={styles.btnCancel}>Cancelar</button>
              <button className={styles.btnSave} onClick={() => { if (userModal.mode === 'add') handleAddUser(); else if (userModal.mode === 'edit') handleEditUser(userModal.userId); else handleResetPassword(userModal.userId); }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
