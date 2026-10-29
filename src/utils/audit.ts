export interface AuditLog {
  id: string;
  user: string;
  action: string;
  detail: string;
  time: string;
  date: string;
  type: 'create' | 'edit' | 'delete' | 'auth' | 'export';
  ip: string;
  device: string;
}

const DEFAULT_LOGS: AuditLog[] = [
  { id: '1', user: 'Ana Lima', action: 'Lead atualizado', detail: 'MetalTech Ltda → Negociação', time: '2 min atrás', date: '2026-06-24', type: 'edit', ip: '192.168.1.45', device: 'Chrome / Windows' },
  { id: '2', user: 'Carlos Melo', action: 'Novo lead criado', detail: 'ConstruMax Ltda', time: '14 min atrás', date: '2026-06-24', type: 'create', ip: '192.168.1.12', device: 'Firefox / Mac' },
  { id: '3', user: 'Administrador', action: 'Login efetuado', detail: 'Sessão iniciada via Painel', time: '38 min atrás', date: '2026-06-24', type: 'auth', ip: '201.45.12.9', device: 'Safari / iPhone' },
  { id: '4', user: 'Roberto Alves', action: 'Lead movido', detail: 'Siderúrgica Sul → Fechamento', time: '1h atrás', date: '2026-06-24', type: 'edit', ip: '192.168.1.88', device: 'Chrome / Linux' },
  { id: '5', user: 'Juliana Pires', action: 'Lead excluído', detail: 'Eletro Industrial', time: '2h atrás', date: '2026-06-23', type: 'delete', ip: '192.168.1.34', device: 'Edge / Windows' },
  { id: '6', user: 'Fernanda Costa', action: 'Configuração alterada', detail: 'Webhook Omie atualizado', time: '3h atrás', date: '2026-06-23', type: 'edit', ip: '192.168.1.56', device: 'Chrome / Windows' },
  { id: '7', user: 'Administrador', action: 'Exportação de relatório', detail: 'Relatório Mensal - Abril 2026', time: '4h atrás', date: '2026-06-22', type: 'export', ip: '201.45.12.9', device: 'Chrome / Mac' },
  { id: '8', user: 'Ana Lima', action: 'Novo evento criado', detail: 'Reunião Apresentação - AgroIndustrial', time: '5h atrás', date: '2026-06-22', type: 'create', ip: '192.168.1.45', device: 'Chrome / Windows' },
];

export const loadAuditLogs = (): AuditLog[] => {
  try {
    const saved = localStorage.getItem('veiga-audit-logs-v2');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  localStorage.setItem('veiga-audit-logs-v2', JSON.stringify(DEFAULT_LOGS));
  return DEFAULT_LOGS;
};

export const saveAuditLogs = (logs: AuditLog[]) => {
  localStorage.setItem('veiga-audit-logs-v2', JSON.stringify(logs));
};

export const addAuditLog = (
  user: string,
  action: string,
  detail: string,
  type: 'create' | 'edit' | 'delete' | 'auth' | 'export'
) => {
  const logs = loadAuditLogs();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const newLog: AuditLog = {
    id: `audit-${Date.now()}`,
    user,
    action,
    detail,
    time: timeStr,
    date: dateStr,
    type,
    ip: '192.168.1.101',
    device: navigator.userAgent.includes('Mobi') ? 'Safari / iPhone' : 'Chrome / Windows'
  };

  saveAuditLogs([newLog, ...logs]);
};
