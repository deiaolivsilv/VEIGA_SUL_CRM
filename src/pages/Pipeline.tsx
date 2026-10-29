import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth, MOCK_USERS } from '../context/AuthContext';
import styles from './Pipeline.module.css';
import { Search, Filter } from 'lucide-react';
import { Lead, Stage } from '../types';
import { DndContext, useSensor, useSensors, PointerSensor, DragEndEvent, DragStartEvent, DragOverlay, closestCorners } from '@dnd-kit/core';

import KanbanColumn from '../components/kanban/KanbanColumn';
import KanbanCard from '../components/kanban/KanbanCard';

const STAGES: Stage[] = [
  'em contato',
  'pré-venda',
  'realizar orçamento',
  'orçamento finalizado',
  'negociação',
  'fechamento',
  'perda'
];

const Pipeline = () => {
  const { leads, updateLead } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchVendor = vendorFilter ? lead.assignedToId === vendorFilter : true;
      return matchSearch && matchVendor;
    });
  }, [leads, searchTerm, vendorFilter]);

  const leadsByStage = useMemo(() => {
    const acc: Record<Stage, Lead[]> = {} as Record<Stage, Lead[]>;
    STAGES.forEach(s => acc[s] = []);
    filteredLeads.forEach(lead => {
      if (acc[lead.stage]) {
        acc[lead.stage].push(lead);
      }
    });
    return acc;
  }, [filteredLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find(l => l.id === active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const overId = over.id as string;
    
    // Find if we are dropping over a column or another card
    const isActiveLead = leads.find(l => l.id === leadId);
    if (!isActiveLead) return;

    const isOverStage = STAGES.includes(overId as Stage);
    const overLead = leads.find(l => l.id === overId);

    let newStage: Stage | null = null;
    if (isOverStage) {
      newStage = overId as Stage;
    } else if (overLead) {
      newStage = overLead.stage;
    }

    if (newStage && newStage !== isActiveLead.stage) {
      updateLead(leadId, { stage: newStage });
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Pipeline</h1>
          <p className={styles.subtitle}>Arraste os leads entre as etapas</p>
        </div>

        <div className={styles.filtersWrapper}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar lead ou empresa..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {user?.role === 'admin' && (
            <div className={styles.filterBox}>
              <Filter size={18} className={styles.filterIcon} />
              <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}>
                <option value="">Todos Vendedores</option>
                {MOCK_USERS.filter(u => u.role !== 'admin').map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      <div className={styles.boardScroll}>
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className={styles.board}>
            {STAGES.map(stage => (
              <KanbanColumn key={stage} stage={stage} items={leadsByStage[stage]} />
            ))}
          </div>

          <DragOverlay>
            {activeLead ? <KanbanCard lead={activeLead} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default Pipeline;
