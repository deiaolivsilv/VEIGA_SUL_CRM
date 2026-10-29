import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth, MOCK_USERS } from '../context/AuthContext';
import styles from './Dashboard.module.css';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { CalendarDays, Users, DollarSign, TrendingUp, Target } from 'lucide-react';
import { isToday } from 'date-fns';
import CountUp from '../components/CountUp';

const STAGE_COLORS: Record<string, string> = {
  'em contato': '#3b82f6', // blue
  'pré-venda': '#8b5cf6', // purple
  'realizar orçamento': '#f59e0b', // orange
  'orçamento finalizado': '#10b981', // green 
  'negociação': '#eab308', // yellow
  'fechamento': '#71BC53', // Brand green
  'perda': '#ef4444', // red
};

const STAGE_ORDER = [
  'em contato', 'pré-venda', 'realizar orçamento', 
  'orçamento finalizado', 'negociação', 'fechamento', 'perda'
];

const FILTER_OPTIONS = [
  { value: 'todo', label: 'Todo o Período' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mês' },
  { value: 'trimestre', label: 'Trimestre' },
  { value: 'semestre', label: 'Semestre' },
  { value: 'anual', label: 'Anual' }
];

const Dashboard = () => {
  const { leads, events, allLeads } = useData();
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

  // Compromissos Hoje
  const todayEvents = useMemo(() => {
    return events.filter(e => isToday(new Date(e.start)));
  }, [events]);

  const distributionByStage = useMemo(() => {
    const counts: Record<string, number> = {
      'em contato': 0, 'pré-venda': 0, 'realizar orçamento': 0,
      'orçamento finalizado': 0, 'negociação': 0, 'fechamento': 0, 'perda': 0
    };
    filteredLeads.forEach(l => {
      if (counts[l.stage] !== undefined) counts[l.stage]++;
    });
    return STAGE_ORDER.map(name => ({ name, value: counts[name] })).filter(s => s.value > 0);
  }, [filteredLeads]);

  const totalLeads = filteredLeads.length;

  const metrics = useMemo(() => {
    const closedSales = filteredLeads.filter(l => l.stage === 'fechamento');
    const activePipeline = filteredLeads.filter(l => l.stage !== 'fechamento' && l.stage !== 'perda');
    
    const conversao = totalLeads > 0 ? ((closedSales.length / totalLeads) * 100).toFixed(1) : '0.0';
    const activeValue = activePipeline.reduce((acc, l) => acc + (l.value || 0), 0);
    
    return {
      total: totalLeads,
      fechamentos: closedSales.length,
      conversao,
      activeValue
    };
  }, [filteredLeads, totalLeads]);

  const performanceByVendor = useMemo(() => {
    const usersToShow = user?.role === 'admin' 
      ? MOCK_USERS.filter(u => u.role !== 'admin') 
      : MOCK_USERS.filter(u => u.id === user?.id);

    return usersToShow.map(u => {
      const vendorLeads = filteredLeads.filter(l => l.assignedToId === u.id);
      const revenue = vendorLeads.reduce((acc, l) => acc + (l.value || 0), 0);
      return { 
        name: u.name.split(' ')[0], 
        revenue 
      };
    });
  }, [filteredLeads, user]);

  const monthlyVolume = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0);
      const label = monthDate.toLocaleDateString('pt-BR', { month: 'short' });
      const count = leads.filter(l => {
        const d = new Date(l.createdAt);
        return d >= monthDate && d <= monthEnd;
      }).length;
      return { month: label, volume: count };
    });
  }, [leads]);

  const recentActivities = useMemo(() => {
    return [...allLeads]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(lead => {
        const vendor = MOCK_USERS.find(u => u.id === lead.assignedToId)?.name.split(' ')[0] || 'Sistema';
        let action = `adicionou o lead ${lead.company || lead.name}`;
        if (lead.stage === 'fechamento') action = `fechou negócio com ${lead.company || lead.name}`;
        if (lead.stage === 'realizar orçamento') action = `criou orçamento para ${lead.company || lead.name}`;
        if (lead.stage === 'negociação') action = `avançou lead ${lead.company || lead.name} para Negociação`;
        
        return {
          id: lead.id,
          vendor,
          action,
          time: 'hoje', 
        }
      });
  }, [filteredLeads]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const vendor = performanceByVendor.find(v => v.name === payload.value);
    const revenueStr = vendor ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(vendor.revenue) : 'R$ 0';
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={15} dy={0} textAnchor="middle" fill="var(--text-muted)" fontSize={12}>
          {payload.value}
        </text>
        <text x={0} y={35} dy={0} textAnchor="middle" fill="var(--text-main)" fontSize={12} fontWeight="bold">
          {revenueStr}
        </text>
      </g>
    );
  };

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
    <div className={`${styles.container} animate-fade-in`}>
      {/* Header with pill filters matching Reports */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Dashboard Principal</h1>
          <p className={styles.subtitle}>Visão geral do CRM</p>
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
          <div className={styles.iconWrapper}>
            <Users size={32} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricTitle}>Seus Leads</span>
            <span className={styles.metricValue}>
              <CountUp end={metrics.total} />
            </span>
            <span className={styles.metricTrend}>Companhia: {allLeads.length}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.iconWrapper}>
            <TrendingUp size={32} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricTitle}>Taxa de Conversão</span>
            <span className={styles.metricValue}>
              <CountUp end={parseFloat(metrics.conversao)} decimals={1} suffix="%" />
            </span>
            <span className={styles.metricTrend}>+2.3%</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.iconWrapper}>
            <Target size={32} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricTitle}>Vendas Fechadas</span>
            <span className={styles.metricValue}>
              <CountUp end={metrics.fechamentos} />
            </span>
            <span className={styles.metricTrend}>+3</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.iconWrapper}>
            <DollarSign size={32} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricTitle}>Receita Prevista</span>
            <span className={styles.metricValue}>
              <CountUp end={metrics.activeValue} prefix="R$ " />
            </span>
            <span className={styles.metricTrend}>+8%</span>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        
        {/* ROW 1 */}
        {user?.role === 'admin' && (
          <div className={`${styles.chartCard} ${styles.colSpan2}`}>
            <h2>Receita por Vendedor</h2>
            <div className={styles.chartWrapper} style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceByVendor} margin={{ top: 20, right: 10, left: -20, bottom: 40 }} barSize={100}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                  <XAxis dataKey="name" tick={<CustomXAxisTick />} tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
                  <YAxis tick={false} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="revenue" name="Receita" fill="#71BC53" radius={[4, 4, 0, 0]} animationDuration={1500} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Leads por Etapa */}
        <div className={`${styles.chartCard} ${user?.role === 'admin' ? styles.colSpan1 : styles.colSpan2}`}>
          <h2>Leads por Etapa</h2>
          <div className={styles.chartWrapper} style={{ height: 320, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionByStage}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={110}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {distributionByStage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.name] || '#ccc'} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{totalLeads}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total de Leads</div>
            </div>
          </div>
        </div>

        {/* Compromissos Hoje */}
        <div className={`${styles.chartCard} ${user?.role === 'admin' ? styles.colSpan1 : styles.colSpan2}`}>
          <h2>Compromissos Hoje</h2>
          <div className={styles.agendaWrapper}>
            <div className={styles.agendaCalendarIcon}>
              <CalendarDays size={32} color="#ef4444" />
              <span className={styles.agendaDateDay}>{new Date().getDate()}</span>
            </div>
            {todayEvents.length === 0 ? (
              <p className={styles.agendaEmpty}>Nenhum compromisso hoje</p>
            ) : (
              <div className={styles.agendaList}>
                {todayEvents.map(ev => {
                  const vendorName = MOCK_USERS.find(u => u.id === ev.assignedToId)?.name || 'Desconhecido';
                  return (
                    <div key={ev.id} className={styles.agendaItem}>
                      <strong>{ev.title}</strong>
                      <span>{new Date(ev.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })} — {vendorName.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ROW 2 */}
        {/* Volume Mensal de Leads */}
        <div className={`${styles.chartCard} ${styles.colSpan2}`}>
          <h2>Volume Mensal de Leads</h2>
          <div className={styles.chartWrapper} style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyVolume} margin={{ top: 20, right: 10, left: -20, bottom: 5 }} barSize={80}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="month" stroke="var(--text-muted)" tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fontSize: 12 }} />
                <YAxis tick={false} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="volume" name="Volume" fill="var(--accent)" radius={[4, 4, 0, 0]} animationDuration={1500} animationEasing="ease-out"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Atividade Recente */}
        <div className={`${styles.chartCard} ${styles.colSpan2}`}>
          <h2>Atividade Recente</h2>
          <div className={styles.activityList}>
            {recentActivities.map((act, i) => (
              <div key={i} className={styles.activityRow}>
                <div className={styles.activityDot}></div>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}><strong>{act.vendor}</strong> {act.action}</p>
                  <span className={styles.activityTime}>{act.time}</span>
                </div>
              </div>
            ))}
            <div className={styles.activityRow}>
              <div className={styles.activityDot}></div>
              <div className={styles.activityContent}>
                <p className={styles.activityText}><strong>Sistema:</strong> 3 lembretes de follow-up vencendo hoje</p>
                <span className={styles.activityTime}>há 2h 30min</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
