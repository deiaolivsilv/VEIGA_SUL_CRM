import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth, MOCK_USERS } from '../context/AuthContext';
import styles from './Reports.module.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import CountUp from '../components/CountUp';

const STAGE_ORDER = [
  'pré-venda', 'em contato', 'realizar orçamento', 
  'orçamento finalizado', 'negociação', 'fechamento'
];

const STAGE_COLORS: Record<string, string> = {
  'em contato': '#3b82f6', // blue
  'pré-venda': '#8b5cf6', // purple
  'realizar orçamento': '#9333ea', // purple darker
  'orçamento finalizado': '#f59e0b', // orange
  'negociação': '#ef4444', // red
  'fechamento': '#10b981', // green
};

const STAGE_LABELS: Record<string, string> = {
  'em contato': 'Em Contato',
  'pré-venda': 'Pré Venda',
  'realizar orçamento': 'Realizar Orçamento',
  'orçamento finalizado': 'Orçamento Finalizado',
  'negociação': 'Negociação',
  'fechamento': 'Fechamento'
};

const FILTER_OPTIONS = [
  { value: 'todo', label: 'Todo o Período' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
  { value: 'trimestre', label: 'Trimestre' },
  { value: 'semestre', label: 'Semestre' },
  { value: 'anual', label: 'Anual' }
];

const Reports = () => {
  const { leads } = useData();
  const { user } = useAuth();
  const [period, setPeriod] = useState<string>('todo');

  const filteredLeads = useMemo(() => {
    const now = new Date();
    return leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      const diffMs = now.getTime() - leadDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (period === 'todo') return true;
      if (period === 'hoje') return diffDays <= 1;
      if (period === 'semana') return diffDays <= 7;
      if (period === 'mes') return diffDays <= 30;
      if (period === 'trimestre') return diffDays <= 90;
      if (period === 'semestre') return diffDays <= 180;
      if (period === 'anual') return diffDays <= 365;
      return true;
    });
  }, [leads, period]);

  const metrics = useMemo(() => {
    const activePipeline = filteredLeads.filter(l => l.stage !== 'fechamento' && l.stage !== 'perda');
    const closedSales = filteredLeads.filter(l => l.stage === 'fechamento');
    
    const revenue = closedSales.reduce((acc, l) => acc + (l.value || 0), 0);
    const activeValue = activePipeline.reduce((acc, l) => acc + (l.value || 0), 0);
    const avgTicket = closedSales.length > 0 ? revenue / closedSales.length : 0;
    
    return { revenue, activeValue, avgTicket, totalClosed: closedSales.length };
  }, [filteredLeads]);

  const vendorPerformance = useMemo(() => {
    const stats: Record<string, { name: string, leads: number, fechamentos: number, perdas: number, receita: number, initial: string, conversao?: string }> = {};
    const usersToShow = user?.role === 'admin' 
      ? MOCK_USERS.filter(u => u.role !== 'admin') 
      : MOCK_USERS.filter(u => u.id === user?.id);

    usersToShow.forEach(u => {
      stats[u.id] = { name: u.name, leads: 0, fechamentos: 0, perdas: 0, receita: 0, initial: u.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() };
    });

    filteredLeads.forEach(l => {
      if (stats[l.assignedToId]) {
        stats[l.assignedToId].leads++;
        if (l.stage === 'fechamento') {
          stats[l.assignedToId].fechamentos++;
          stats[l.assignedToId].receita += (l.value || 0);
        }
        if (l.stage === 'perda') {
          stats[l.assignedToId].perdas++;
        }
      }
    });

    return Object.values(stats).map(v => ({
      ...v,
      conversao: v.leads > 0 ? ((v.fechamentos / v.leads) * 100).toFixed(0) : '0'
    }));
  }, [filteredLeads, user]);

  const conversionByStage = useMemo(() => {
    const counts: Record<string, number> = {};
    STAGE_ORDER.forEach(s => counts[s] = 0);
    
    filteredLeads.forEach(l => {
      if (counts[l.stage] !== undefined) counts[l.stage]++;
    });
    
    const total = filteredLeads.length;
    return STAGE_ORDER.map(stage => {
      const count = counts[stage];
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return { stage, count, pct };
    });
  }, [filteredLeads]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          {payload.map((entry: { name: string, value: number, color?: string, fill?: string }, index: number) => (
            <div key={index} style={{ color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color || entry.fill }}></span>
              {entry.name}: {entry.value}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Relatórios & Analytics</h1>
          <p className={styles.subtitle}>Desempenho comercial e análise do pipeline</p>
        </div>

        <div className={styles.pillBox}>
          {FILTER_OPTIONS.map(opt => (
            <button 
              key={opt.value} 
              className={`${styles.pillBtn} ${period === opt.value ? styles.pillActive : ''}`}
              onClick={() => setPeriod(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <h3>Receita Realizada</h3>
          <p className={styles.metricValue} style={{ color: '#71BC53' }}>
            <CountUp end={metrics.revenue} prefix="R$ " />
          </p>
        </div>
        <div className={styles.metricCard}>
          <h3>Pipeline Ativo</h3>
          <p className={styles.metricValue} style={{ color: '#3b82f6' }}>
            <CountUp end={metrics.activeValue} prefix="R$ " />
          </p>
        </div>
        <div className={styles.metricCard}>
          <h3>Ticket Médio</h3>
          <p className={styles.metricValue} style={{ color: '#8b5cf6' }}>
            <CountUp end={metrics.avgTicket} prefix="R$ " />
          </p>
        </div>
      </div>

      <div className={styles.splitLayout}>
        <div className={styles.tableCard}>
          <h2>Desempenho por Vendedor</h2>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>VENDEDOR</th>
                  <th>LEADS</th>
                  <th>FECHADOS</th>
                  <th>PERDIDOS</th>
                  <th>CONVERSÃO</th>
                  <th>RECEITA</th>
                </tr>
              </thead>
              <tbody>
                {vendorPerformance.map(v => (
                  <tr key={v.name}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                      <div className={styles.avatarMini}>{v.initial}</div>
                      {v.name}
                    </td>
                    <td align="center">{v.leads}</td>
                    <td align="center" style={{ color: 'var(--accent)', fontWeight: 600 }}>{v.fechamentos}</td>
                    <td align="center" style={{ color: '#ef4444' }}>{v.perdas}</td>
                    <td align="center">
                      <div className={styles.progressCell}>
                        <div className={styles.progressBarBg}>
                          <div className={styles.progressBarFill} style={{ width: `${v.conversao}%`, backgroundColor: 'var(--accent)' }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>{v.conversao}%</span>
                      </div>
                    </td>
                    <td align="center" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v.receita)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.tableCard}>
          <h2>Taxa de Conversão por Etapa</h2>
          <div className={styles.stagesList}>
            {conversionByStage.map(item => (
              <div key={item.stage} className={styles.stageProgressRow}>
                <div className={styles.stageLabels}>
                  <span className={styles.stageName}>{STAGE_LABELS[item.stage]}</span>
                  <span className={styles.stageNumbers}>{item.count} leads ({item.pct}%)</span>
                </div>
                <div className={styles.progressBarBg}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ width: `${item.pct}%`, backgroundColor: STAGE_COLORS[item.stage] }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={`${styles.chartCard}`} style={{ gridColumn: '1 / -1' }}>
          <h2>{user?.role === 'admin' ? 'Receita Fechada por Vendedor' : 'Conversão por Etapa'}</h2>
          <div className={styles.chartWrapper} style={{ height: 280 }}>
            {user?.role === 'admin' ? (
              vendorPerformance.every(v => v.receita === 0) ? (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  Nenhuma receita realizada no período.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendorPerformance} margin={{ top: 20, right: 10, left: 10, bottom: 40 }} barSize={80}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={{ stroke: 'var(--border)' }}
                      tick={(props: any) => {
                        const { x, y, payload } = props;
                        const vendor = vendorPerformance.find(v => v.name.split(' ')[0] === payload.value || v.name === payload.value);
                        const shortName = payload.value.split(' ')[0];
                        const revenueStr = vendor ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(vendor.receita) : 'R$ 0';
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text x={0} y={15} textAnchor="middle" fill="var(--text-muted)" fontSize={12}>{shortName}</text>
                            <text x={0} y={35} textAnchor="middle" fill="var(--text-main)" fontSize={11} fontWeight="bold">{revenueStr}</text>
                          </g>
                        );
                      }}
                    />
                    <YAxis tick={false} axisLine={false} tickLine={false} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="receita" name="Receita" fill="var(--accent)" radius={[4, 4, 0, 0]} animationDuration={1500} animationEasing="ease-out" />
                  </BarChart>
                </ResponsiveContainer>
              )
            ) : (
              conversionByStage.every(s => s.count === 0) ? (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  Nenhum dado no período selecionado.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conversionByStage} layout="vertical" margin={{ top: 5, right: 60, left: 120, bottom: 5 }} barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.4} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="stage"
                      tick={(props: any) => {
                        const { x, y, payload } = props;
                        return (
                          <text x={x - 4} y={y + 4} textAnchor="end" fill="var(--text-muted)" fontSize={12}>
                            {STAGE_LABELS[payload.value] || payload.value}
                          </text>
                        );
                      }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" name="Leads" fill="var(--accent)" radius={[0, 4, 4, 0]} animationDuration={1500} animationEasing="ease-out" />
                  </BarChart>
                </ResponsiveContainer>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
