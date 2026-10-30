import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { MOCK_USERS } from '../context/AuthContext';
import styles from './Leads.module.css';
import { 
  Search, Plus, Edit2, Trash2, Building2, Mail, Phone, 
  UserRound, Eye, ChevronLeft, ChevronRight, MapPin, FileText 
} from 'lucide-react';
import { Lead, Stage } from '../types';
import Modal from '../components/Modal';
import { LeadHistory } from '../components/LeadHistory';

const STAGES: Stage[] = [
  'em contato', 'pré-venda', 'realizar orçamento',
  'orçamento finalizado', 'negociação', 'fechamento', 'perda'
];

const STAGE_LABELS: Record<Stage, string> = {
  'em contato': 'Em Contato',
  'pré-venda': 'Pré Venda',
  'realizar orçamento': 'Realizar',
  'orçamento finalizado': 'Finalizado',
  'negociação': 'Negociação',
  'fechamento': 'Fechamento',
  'perda': 'Perda'
};

const STAGE_COLORS: Record<Stage, { bg: string; color: string }> = {
  'em contato':         { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6' },
  'pré-venda':          { bg: 'rgba(139,92,246,0.12)',  color: '#8b5cf6' },
  'realizar orçamento': { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  'orçamento finalizado':{ bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  'negociação':         { bg: 'rgba(234,179,8,0.12)',   color: '#ca8a04' },
  'fechamento':         { bg: 'rgba(113,188,83,0.15)',  color: '#71BC53' },
  'perda':              { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
};

const LEADS_PER_PAGE = 12;

// Função auxiliar universal para formatar a moeda (BRL ou USD)
const formatMoney = (val: number = 0, currency: 'BRL' | 'USD' = 'BRL') => {
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(val);
};

const Leads = () => {
  const { leads, addLead, updateLead, deleteLead } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [stageFilter, setStageFilter] = useState<Stage | ''>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [currentLead, setCurrentLead] = useState<Partial<Lead>>({});

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const termo = searchTerm.toLowerCase();

      const name = lead.name?.toLowerCase() || '';
      const company = lead.company?.toLowerCase() || '';
      const email = lead.email?.toLowerCase() || '';
      const taxId = (lead.taxId?.number || lead.cnpj || '').toLowerCase();
      const city = (lead.address?.city || lead.city || '').toLowerCase();

      const matchSearch = 
        name.includes(termo) ||
        company.includes(termo) ||
        email.includes(termo) ||
        taxId.includes(termo) ||
        city.includes(termo);

      const matchStage = stageFilter ? lead.stage === stageFilter : true;
      return matchSearch && matchStage;
    });
  }, [leads, searchTerm, stageFilter]);

  const totalPages = Math.ceil(filteredLeads.length / LEADS_PER_PAGE);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * LEADS_PER_PAGE,
    currentPage * LEADS_PER_PAGE
  );

  const openAddModal = () => {
    setModalMode('add');
    setCurrentLead({ stage: 'em contato', value: 0, currency: 'BRL' });
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setModalMode('edit');
    setCurrentLead(lead);
    setIsModalOpen(true);
  };

  const openViewModal = (lead: Lead) => {
    setModalMode('view');
    setCurrentLead(lead);
    setIsModalOpen(true);
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
      addLead(currentLead as Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (modalMode === 'edit') {
      updateLead(currentLead.id as string, currentLead);
    }
    setIsModalOpen(false);
  };

  const handleAddHistoryItem = (newHistoryItem: any) => {
    if (!currentLead.id) return;
    
    const updatedHistory = [...(currentLead.history || []), newHistoryItem];
    const updatedLead = { ...currentLead, history: updatedHistory };
    
    setCurrentLead(updatedLead);
    updateLead(currentLead.id, updatedLead);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este lead?')) {
      deleteLead(id);
    }
  };

  const vendorName = (id: string) =>
    MOCK_USERS.find(u => u.id === id)?.name || 'Desconhecido';

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleArea}>
            <h1 className={styles.title}>Leads</h1>
            <p className={styles.subtitle}>Gerencie e acompanhe seus clientes em potencial</p>
          </div>

          <div className={styles.controls}>
            <div className={styles.filters}>
              <div className={styles.searchBox}>
                <Search size={18} className={styles.icon} />
                <input
                  type="text"
                  placeholder="Buscar lead, empresa, CNPJ/Tax ID ou cidade..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <select
                className={styles.stageSelect}
                value={stageFilter}
                onChange={e => {
                  setStageFilter(e.target.value as Stage | '');
                  setCurrentPage(1);
                }}
              >
                <option value="">Todas as Etapas</option>
                {STAGES.map(s => (
                  <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <button className={styles.addBtn} onClick={openAddModal}>
              <Plus size={18} /> Novo Lead
            </button>
          </div>
        </div>
      </header>

      <div className={styles.gridContainer}>
        {filteredLeads.length === 0 ? (
          <div className={styles.emptyState}>Nenhum lead encontrado.</div>
        ) : (
          <>
            <div className={styles.cardsGrid}>
              {paginatedLeads.map(lead => {
                const stageStyle = STAGE_COLORS[lead.stage] || { bg: 'rgba(100,100,100,0.1)', color: '#666' };
                const displayCity = lead.address?.city || lead.city;
                const displayTaxId = lead.taxId?.number || lead.cnpj;

                return (
                  <div key={lead.id} className={styles.leadCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.nameHeader}>
                        <h3 className={styles.leadName}>{lead.name}</h3>
                        <div className={styles.cardActions}>
                          <button className={styles.actionBtn} title="Visualizar" onClick={() => openViewModal(lead)}>
                            <Eye size={15} />
                          </button>
                          <button className={styles.actionBtn} title="Editar" onClick={() => openEditModal(lead)}>
                            <Edit2 size={15} />
                          </button>
                          <button className={`${styles.actionBtn} ${styles.actionDelete}`} title="Excluir" onClick={(e) => handleDelete(lead.id, e)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <div className={styles.infoRowCompany}>
                        <Building2 size={13} className={styles.infoIcon} />
                        <span>{lead.company}</span>
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.infoRow}>
                        <Mail size={13} className={styles.infoIcon} />
                        <span>{lead.email || '—'}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <Phone size={13} className={styles.infoIcon} />
                        <span>{lead.phone || '—'}</span>
                      </div>
                      {displayCity && (
                        <div className={styles.infoRow}>
                          <MapPin size={13} className={styles.infoIcon} />
                          <span>{displayCity}</span>
                        </div>
                      )}
                      {displayTaxId && (
                        <div className={styles.infoRow}>
                          <FileText size={13} className={styles.infoIcon} />
                          <span>{displayTaxId}</span>
                        </div>
                      )}
                      <div className={styles.infoRow}>
                        <UserRound size={13} className={styles.infoIcon} />
                        <span>{vendorName(lead.assignedToId)}</span>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.badge} style={{ backgroundColor: stageStyle.bg, color: stageStyle.color }}>
                        {STAGE_LABELS[lead.stage]}
                      </span>
                      {/* VALOR DINÂMICO (BRL ou USD) */}
                      <span className={styles.leadValue}>
                        {formatMoney(lead.value, lead.currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className={styles.pageBtn}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL INTEGRADO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Novo Lead' : modalMode === 'edit' ? 'Editar Lead' : 'Detalhes do Lead'}
        footer={
          modalMode === 'view' ? (
            <>
              <button className={styles.btnSecondary} onClick={() => setIsModalOpen(false)}>Fechar</button>
              <button className={styles.addBtn} onClick={() => setModalMode('edit')}><Edit2 size={16} /> Editar</button>
            </>
          ) : (
            <>
              <button className={styles.btnSecondary} onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className={styles.addBtn} form="leadForm" type="submit">Salvar</button>
            </>
          )
        }
      >
        {/* MODO VISUALIZAÇÃO COM HISTÓRICO */}
        {modalMode === 'view' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border text-sm">
              <div><strong>Nome:</strong> {currentLead.name}</div>
              <div><strong>Empresa:</strong> {currentLead.company}</div>
              <div><strong>Email:</strong> {currentLead.email || '—'}</div>
              <div><strong>Telefone:</strong> {currentLead.phone || '—'}</div>
              <div><strong>Cidade:</strong> {currentLead.city || currentLead.address?.city || '—'}</div>
              <div><strong>Documento:</strong> {currentLead.cnpj || currentLead.taxId?.number || '—'}</div>
              <div><strong>Vendedor:</strong> {vendorName(currentLead.assignedToId || '')}</div>
              <div><strong>Valor:</strong> {formatMoney(currentLead.value, currentLead.currency)}</div>
              {currentLead.notes && (
                <div className="col-span-2"><strong>Notas:</strong> {currentLead.notes}</div>
              )}
            </div>

            <LeadHistory 
              leadId={currentLead.id!} 
              history={currentLead.history} 
              onAddHistory={handleAddHistoryItem} 
            />
          </div>
        ) : (
          /* FORMULÁRIO DE ADIÇÃO / EDIÇÃO COM SELETOR DE MOEDA */
          <form id="leadForm" onSubmit={handleSaveLead} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Nome</label>
              <input required type="text" value={currentLead.name || ''} onChange={e => setCurrentLead({...currentLead, name: e.target.value})} />
            </div>

            <div className={styles.formGroup}>
              <label>Empresa</label>
              <input required type="text" value={currentLead.company || ''} onChange={e => setCurrentLead({...currentLead, company: e.target.value})} />
            </div>
            
            <div className={styles.formGroup}>
              <label>CNPJ / Tax ID / Documento Fiscal</label>
              <input 
                type="text" 
                placeholder="Ex: 00.000.000/0001-00 ou EIN 12-3456789" 
                value={currentLead.cnpj || currentLead.taxId?.number || ''} 
                onChange={e => setCurrentLead({
                  ...currentLead, 
                  cnpj: e.target.value,
                  taxId: { type: 'Tax ID', number: e.target.value }
                })} 
              />
            </div>

            <div className={styles.formGroup}>
              <label>Cidade</label>
              <input 
                type="text" 
                placeholder="Ex: São Paulo, New York, Lisboa..." 
                value={currentLead.city || currentLead.address?.city || ''} 
                onChange={e => setCurrentLead({
                  ...currentLead, 
                  city: e.target.value,
                  address: { ...currentLead.address, city: e.target.value }
                })} 
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" value={currentLead.email || ''} onChange={e => setCurrentLead({...currentLead, email: e.target.value})} />
            </div>

            <div className={styles.formGroup}>
              <label>Telefone / WhatsApp</label>
              <input 
                type="text" 
                placeholder="Ex: +55 (11) 99999-9999 ou +1 (555) 000-0000" 
                value={currentLead.phone || ''} 
                onChange={e => setCurrentLead({...currentLead, phone: e.target.value})} 
              />
            </div>

            <div className={styles.formGroup}>
              <label>Vendedor</label>
              <select required value={currentLead.assignedToId || ''} onChange={e => setCurrentLead({...currentLead, assignedToId: e.target.value})}>
                <option value="">Selecione...</option>
                {MOCK_USERS.filter(u => u.role !== 'admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Etapa</label>
              <select required value={currentLead.stage || 'em contato'} onChange={e => setCurrentLead({...currentLead, stage: e.target.value as Stage})}>
                {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
            </div>

            {/* SELETOR DE MOEDA (BRL ou USD) */}
            <div className={styles.formGroup}>
              <label>Moeda</label>
              <select 
                value={currentLead.currency || 'BRL'} 
                onChange={e => setCurrentLead({...currentLead, currency: e.target.value as 'BRL' | 'USD'})}
              >
                <option value="BRL">Real (R$)</option>
                <option value="USD">Dólar (US$)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Valor Estimado</label>
              <input type="number" required min="0" value={currentLead.value || 0} onChange={e => setCurrentLead({...currentLead, value: Number(e.target.value)})} />
            </div>

            <div className={styles.formGroup}>
              <label>Canal de Origem</label>
              <select value={currentLead.source || ''} onChange={e => setCurrentLead({...currentLead, source: e.target.value})}>
                <option value="">Selecione...</option>
                <option value="Site">Site</option>
                <option value="Indicação">Indicação</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Feira">Feira de Evento</option>
                <option value="Instagram">Instagram</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label>Notas adicionais</label>
              <textarea rows={3} value={currentLead.notes || ''} onChange={e => setCurrentLead({...currentLead, notes: e.target.value})}></textarea>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Leads;