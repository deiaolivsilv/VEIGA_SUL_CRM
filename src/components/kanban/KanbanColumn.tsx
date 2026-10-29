import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Lead, Stage } from '../../types';
import KanbanCard from './KanbanCard';
import styles from '../../pages/Pipeline.module.css';

interface KanbanColumnProps {
  stage: Stage;
  items: Lead[];
}

const STAGE_HEADERS: Record<Stage, string> = {
  'em contato': 'Em Contato',
  'pré-venda': 'Pré-Venda',
  'realizar orçamento': 'Realizar Orçamento',
  'orçamento finalizado': 'Orçamento Finalizado',
  'negociação': 'Negociação',
  'fechamento': 'Fechamento',
  'perda': 'Perda'
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, items }) => {
  const { setNodeRef } = useDroppable({
    id: stage,
    data: { type: 'Column', stage }
  });

  const totalValue = items.reduce((acc, lead) => acc + (lead.value || 0), 0);
  const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalValue);

  return (
    <div className={styles.kanbanColumn}>
      <div className={styles.kanbanColumnHeader}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: `var(--stage-${Object.keys(STAGE_HEADERS).indexOf(stage) + 1})` }} />
            {STAGE_HEADERS[stage]}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {formattedTotal}
          </div>
        </div>
        <span className={styles.kanbanBadge}>{items.length}</span>
      </div>
      
      <div className={styles.kanbanList} ref={setNodeRef}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map(lead => (
            <KanbanCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;
