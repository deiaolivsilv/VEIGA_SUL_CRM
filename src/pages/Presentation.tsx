import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import styles from './Presentation.module.css';
import { Printer, Sliders, Eye } from 'lucide-react';
import { addAuditLog } from '../utils/audit';

const Presentation = () => {
  const { user } = useAuth();
  const { leads } = useData();

  // Customization states
  const [title, setTitle] = useState('Apresentação de Resultados Comerciais');
  const [subtitle, setSubtitle] = useState('Análise de oportunidades e pipeline de vendas');
  const [clientName, setClientName] = useState('Conselho de Administração');
  const [accentColor, setAccentColor] = useState('#71bc53'); // Default Veiga Sul green
  const [showSummary, setShowSummary] = useState(true);
  const [showLeadsTable, setShowLeadsTable] = useState(true);
  const [showStagesList, setShowStagesList] = useState(true);
  const [customNotes, setCustomNotes] = useState(
    'Esta apresentação compila os leads ativos, a distribuição de orçamentos e as principais métricas do funil de vendas. Os dados apresentados demonstram uma excelente performance com leads altamente qualificados nas etapas finais de negociação.'
  );

  // Compute CRM metrics
  const totalLeads = leads.length;
  const totalValue = useMemo(() => {
    return leads.reduce((sum, lead) => sum + (lead.value || 0), 0);
  }, [leads]);

  const leadsByStage = useMemo(() => {
    const stages: Record<string, { count: number; value: number }> = {};
    leads.forEach(lead => {
      const stageName = lead.stage.toUpperCase();
      if (!stages[stageName]) {
        stages[stageName] = { count: 0, value: 0 };
      }
      stages[stageName].count += 1;
      stages[stageName].value += lead.value || 0;
    });
    return Object.entries(stages).map(([name, data]) => ({ name, ...data }));
  }, [leads]);

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handlePrint = () => {
    // Add audit log for report generation
    addAuditLog(
      user?.name || 'Administrador',
      'Apresentação PDF gerada',
      `Relatório customizado para: ${clientName}`,
      'export'
    );
    window.print();
  };

  return (
    <div className={styles.container}>
      {/* Configuration Panel - Hidden during Printing */}
      <aside className={styles.configPanel}>
        <div className={styles.panelHeader}>
          <Sliders size={20} className={styles.accentIcon} />
          <h2>Customizar PDF</h2>
        </div>
        
        <div className={styles.formGroup}>
          <label>Título do Documento</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Digite o título principal..."
          />
        </div>

        <div className={styles.formGroup}>
          <label>Subtítulo</label>
          <input 
            type="text" 
            value={subtitle} 
            onChange={e => setSubtitle(e.target.value)} 
            placeholder="Digite o subtítulo..."
          />
        </div>

        <div className={styles.formGroup}>
          <label>Apresentado Para (Cliente / Diretoria)</label>
          <input 
            type="text" 
            value={clientName} 
            onChange={e => setClientName(e.target.value)} 
            placeholder="Ex: Conselho Veiga Sul..."
          />
        </div>

        <div className={styles.formGroup}>
          <label>Cor de Destaque (Accent)</label>
          <div className={styles.colorPickerWrapper}>
            <input 
              type="color" 
              value={accentColor} 
              onChange={e => setAccentColor(e.target.value)} 
              className={styles.colorPicker}
            />
            <span className={styles.colorValue}>{accentColor}</span>
          </div>
        </div>

        <div className={styles.sectionToggles}>
          <label className={styles.sectionTogglesTitle}>Seções Visíveis</label>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              checked={showSummary} 
              onChange={e => setShowSummary(e.target.checked)} 
            />
            Resumo Comercial (KPIs)
          </label>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              checked={showStagesList} 
              onChange={e => setShowStagesList(e.target.checked)} 
            />
            Funil de Vendas (Etapas)
          </label>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              checked={showLeadsTable} 
              onChange={e => setShowLeadsTable(e.target.checked)} 
            />
            Tabela de Leads Ativos
          </label>
        </div>

        <div className={styles.formGroup}>
          <label>Notas de Apresentação / Comentários</label>
          <textarea 
            value={customNotes} 
            onChange={e => setCustomNotes(e.target.value)} 
            rows={5}
            placeholder="Adicione considerações finais..."
          />
        </div>

        <button onClick={handlePrint} className={styles.printBtn}>
          <Printer size={18} /> Imprimir / Salvar PDF
        </button>
      </aside>

      {/* A4 Sheet Preview Panel */}
      <main className={styles.previewContainer}>
        <div className={styles.previewHeader}>
          <Eye size={18} />
          <span>Visualização Prévia (Página A4)</span>
        </div>

        <div className={styles.a4Page} id="printable-area" style={{ '--accent-color': accentColor } as React.CSSProperties}>
          {/* A4 Logo & Header */}
          <header className={styles.docHeader}>
            <img 
              src="/logo-without-sub.png" 
              alt="Veiga Sul Logo" 
              className={styles.docLogo}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<h2 class="' + styles.fallbackLogo + '">VEIGA SUL</h2>';
              }}
            />
            <div className={styles.docMeta}>
              <p><strong>Emissão:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
              <p><strong>Para:</strong> {clientName}</p>
            </div>
          </header>

          <hr className={styles.docDivider} />

          {/* Document Titles */}
          <section className={styles.docTitleSection}>
            <h1 className={styles.docTitle}>{title}</h1>
            <p className={styles.docSubtitle}>{subtitle}</p>
          </section>

          {/* KPI Summary Block */}
          {showSummary && (
            <section className={styles.docSection}>
              <h3 className={styles.sectionHeading}>Métricas Gerais do Pipeline</h3>
              <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                  <span className={styles.kpiLabel}>Total de Leads Ativos</span>
                  <span className={styles.kpiValue}>{totalLeads}</span>
                </div>
                <div className={styles.kpiCard}>
                  <span className={styles.kpiLabel}>Valor Estimado Funil</span>
                  <span className={styles.kpiValue} style={{ color: 'var(--accent-color)' }}>{formatCurrency(totalValue)}</span>
                </div>
                <div className={styles.kpiCard}>
                  <span className={styles.kpiLabel}>Ticket Médio por Lead</span>
                  <span className={styles.kpiValue}>{formatCurrency(totalLeads > 0 ? totalValue / totalLeads : 0)}</span>
                </div>
              </div>
            </section>
          )}

          {/* Funnel Stage distribution */}
          {showStagesList && (
            <section className={styles.docSection}>
              <h3 className={styles.sectionHeading}>Distribuição de Oportunidades por Etapa</h3>
              <table className={styles.docTable}>
                <thead>
                  <tr>
                    <th>Etapa do Funil</th>
                    <th style={{ textAlign: 'center' }}>Quantidade</th>
                    <th style={{ textAlign: 'right' }}>Valor Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {leadsByStage.map(stage => (
                    <tr key={stage.name}>
                      <td style={{ fontWeight: 600 }}>{stage.name}</td>
                      <td style={{ textAlign: 'center' }}>{stage.count}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(stage.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Active leads table */}
          {showLeadsTable && (
            <section className={styles.docSection}>
              <h3 className={styles.sectionHeading}>Lista de Leads Ativos</h3>
              <table className={styles.docTable}>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Responsável</th>
                    <th>Etapa</th>
                    <th style={{ textAlign: 'right' }}>Valor estimado</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 10).map(lead => (
                    <tr key={lead.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{lead.company}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{lead.name}</div>
                      </td>
                      <td>{lead.assignedToId === 'u2' ? 'Ana Lima' : lead.assignedToId === 'u3' ? 'Carlos Melo' : lead.assignedToId === 'u4' ? 'Roberto Alves' : 'Geral'}</td>
                      <td><span className={styles.stageBadge}>{lead.stage}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(lead.value || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leads.length > 10 && (
                <p className={styles.tableNote}>* Exibindo os primeiros 10 leads de {leads.length} totais cadastrados no sistema.</p>
              )}
            </section>
          )}

          {/* Custom Notes Section */}
          {customNotes && (
            <section className={styles.docSection}>
              <h3 className={styles.sectionHeading}>Notas e Considerações Finais</h3>
              <div className={styles.notesBox}>
                <p>{customNotes}</p>
              </div>
            </section>
          )}

          {/* Document Footer Signatures */}
          <footer className={styles.docFooter}>
            <div className={styles.sigArea}>
              <div className={styles.sigLine}></div>
              <p><strong>Apresentador Responsável</strong></p>
              <p>{user?.name || 'Administrador'}</p>
            </div>
            <div className={styles.sigArea}>
              <div className={styles.sigLine}></div>
              <p><strong>Aprovador / Cliente</strong></p>
              <p>{clientName}</p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Presentation;
