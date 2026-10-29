import { useState, useMemo } from 'react';
import styles from './Audit.module.css';
import {
  UserPlus, FileText, Globe, Smartphone, Search, Filter,
  ShieldCheck, Edit2, Trash2, Clock
} from 'lucide-react';
import { loadAuditLogs, addAuditLog, AuditLog } from '../utils/audit';
import { useAuth } from '../context/AuthContext';

const Audit = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>(() => loadAuditLogs());
  const [auditSearch, setAuditSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  const uniqueUsers = useMemo(() => {
    const users = logs.map(log => log.user);
    return Array.from(new Set(users));
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.user.toLowerCase().includes(auditSearch.toLowerCase()) || 
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.detail.toLowerCase().includes(auditSearch.toLowerCase());
      
      const matchesType = selectedType === 'all' || log.type === selectedType;
      const matchesUser = selectedUser === 'all' || log.user === selectedUser;
      const matchesDate = !selectedDate || log.date === selectedDate;

      return matchesSearch && matchesType && matchesUser && matchesDate;
    });
  }, [logs, auditSearch, selectedType, selectedUser, selectedDate]);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['ID', 'Usuario', 'Acao', 'Detalhes', 'Data', 'Hora', 'Tipo', 'IP', 'Dispositivo'];
    const rows = filteredLogs.map(log => [
      log.id,
      `"${log.user.replace(/"/g, '""')}"`,
      `"${log.action.replace(/"/g, '""')}"`,
      `"${log.detail.replace(/"/g, '""')}"`,
      log.date,
      `"${log.time.replace(/"/g, '""')}"`,
      log.type,
      log.ip,
      `"${log.device.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Dynamic Audit Log on CSV export
    addAuditLog(user?.name || 'Administrador', 'Exportação de logs', `Exportou ${filteredLogs.length} logs para CSV`, 'export');
    setLogs(loadAuditLogs());
  };

  const logIcon = (type: string) => {
    if (type === 'create') return <div className={`${styles.auditIcon} ${styles.bgCreate}`}><UserPlus size={14} /></div>;
    if (type === 'edit') return <div className={`${styles.auditIcon} ${styles.bgEdit}`}><Edit2 size={14} /></div>;
    if (type === 'delete') return <div className={`${styles.auditIcon} ${styles.bgDelete}`}><Trash2 size={14} /></div>;
    if (type === 'auth') return <div className={`${styles.auditIcon} ${styles.bgAuth}`}><ShieldCheck size={14} /></div>;
    return <div className={`${styles.auditIcon} ${styles.bgExport}`}><FileText size={14} /></div>;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>Auditoria</h1>
            <p className={styles.subtitle}>Logs e histórico de ações do sistema comercial</p>
          </div>
        </div>
      </header>

      <div className={styles.viewContainer}>
        <div className={styles.auditControls}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              placeholder="Filtrar por usuário, ação ou detalhe..." 
              value={auditSearch}
              onChange={e => setAuditSearch(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
             <button 
               className={`${styles.filterBtn} ${showFilters || selectedType !== 'all' || selectedUser !== 'all' || selectedDate !== '' ? styles.activeFilterBtn : ''}`}
               onClick={() => setShowFilters(!showFilters)}
             >
               <Filter size={16} /> Filtros
             </button>
             <button className={styles.exportBtn} onClick={handleExportCSV} disabled={filteredLogs.length === 0}>
               <FileText size={16} /> Exportar CSV
             </button>
          </div>
        </div>

        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>Tipo de Ação</label>
              <select 
                className={styles.filterSelect}
                value={selectedType} 
                onChange={e => setSelectedType(e.target.value)}
              >
                <option value="all">Todos os tipos</option>
                <option value="create">Criar</option>
                <option value="edit">Editar</option>
                <option value="delete">Excluir</option>
                <option value="auth">Autenticação</option>
                <option value="export">Exportação</option>
              </select>
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>Usuário</label>
              <select 
                className={styles.filterSelect}
                value={selectedUser} 
                onChange={e => setSelectedUser(e.target.value)}
              >
                <option value="all">Todos os usuários</option>
                {uniqueUsers.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>Data</label>
              <input 
                type="date"
                className={styles.filterInput}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
            {(selectedType !== 'all' || selectedUser !== 'all' || selectedDate !== '' || auditSearch !== '') && (
              <button 
                className={styles.clearFiltersBtn} 
                onClick={() => { setSelectedType('all'); setSelectedUser('all'); setSelectedDate(''); setAuditSearch(''); }}
              >
                Limpar Filtros
              </button>
            )}
          </div>
        )}

        <div className={styles.timeline}>
          {filteredLogs.length === 0 ? (
            <div className={styles.emptyAudit}>Nenhum log encontrado para esta busca.</div>
          ) : (
            filteredLogs.map((log, index) => (
              <div key={log.id} className={styles.timelineItem}>
                <div className={styles.timelinePoint}>
                   {logIcon(log.type)}
                   {index !== filteredLogs.length - 1 && <div className={styles.timelineLine} />}
                </div>
                <div className={styles.timelineContent}>
                   <div className={styles.timelineHeader}>
                      <span className={styles.auditUser}>{log.user}</span>
                      <span className={styles.auditTime}><Clock size={12} /> {log.date} às {log.time}</span>
                   </div>
                   <div className={styles.auditActionText}>{log.action}</div>
                   <div className={styles.auditDetailText}>{log.detail}</div>
                   <div className={styles.auditMeta}>
                      <span className={styles.metaItem}><Globe size={11} /> {log.ip}</span>
                      <span className={styles.metaItem}><Smartphone size={11} /> {log.device}</span>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Audit;
