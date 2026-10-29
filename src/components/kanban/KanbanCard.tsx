import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '../../types';
import { MOCK_USERS } from '../../context/AuthContext';
import styles from '../../pages/Pipeline.module.css';

interface KanbanCardProps {
  lead: Lead;
  isOverlay?: boolean;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ lead, isOverlay }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: { type: 'Lead', lead },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const vendorName = MOCK_USERS.find(u => u.id === lead.assignedToId)?.name || 'Desconhecido';

  const cardClasses = [
    styles.kanbanCard,
    isDragging ? styles.cardDragging : '',
    isOverlay ? styles.cardOverlay : ''
  ].join(' ').trim();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cardClasses}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardVendor}>Responsável: {vendorName.split(' ')[0]}</span>
      </div>
      <div className={styles.cardTitle}>{lead.name}</div>
      <div className={styles.cardCompany}>{lead.company}</div>
      <div className={styles.cardValue}>
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value)}
      </div>
    </div>
  );
};

export default KanbanCard;
