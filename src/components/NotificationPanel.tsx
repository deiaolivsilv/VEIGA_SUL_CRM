import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Bell, Calendar, TrendingUp } from 'lucide-react';
import { isToday, isTomorrow } from 'date-fns';
import styles from './NotificationPanel.module.css';

const NotificationPanel = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { events, leads } = useData();

  const notifications = useMemo(() => {
    const items = [];
    
    // Check Events
    const todayEvents = events.filter(e => isToday(new Date(e.start)));
    const tomorrowEvents = events.filter(e => isTomorrow(new Date(e.start)));
    
    if (todayEvents.length > 0) {
      items.push({
        id: 'ev-today',
        title: 'Reuniões Hoje',
        desc: `Você tem ${todayEvents.length} compromisso(s) marcardo(s) para hoje.`,
        icon: <Calendar size={16} />,
        time: 'Agora',
        type: 'alert'
      });
    }

    if (tomorrowEvents.length > 0) {
      items.push({
        id: 'ev-tom',
        title: 'Amanhã',
        desc: `${tomorrowEvents.length} compromisso(s) na agenda de amanhã.`,
        icon: <Calendar size={16} />,
        time: 'Em breve',
        type: 'info'
      });
    }

    // Check Leads
    const preVenda = leads.filter(l => l.stage === 'pré-venda');
    if (preVenda.length > 0) {
      items.push({
        id: 'ld-prev',
        title: 'Leads em Pré-venda',
        desc: `Há ${preVenda.length} lead(s) aguardando priorização na fase de Pré-venda.`,
        icon: <TrendingUp size={16} />,
        time: 'Pendente',
        type: 'warning'
      });
    }

    return items;
  }, [events, leads]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3>Notificações</h3>
          <span className={styles.badge}>{notifications.length}</span>
        </div>
        
        <div className={styles.content}>
          {notifications.length > 0 ? (
            notifications.map(n => (
              <div key={n.id} className={`${styles.item} ${styles[n.type]}`}>
                <div className={styles.iconBox}>{n.icon}</div>
                <div className={styles.details}>
                  <strong>{n.title}</strong>
                  <p>{n.desc}</p>
                </div>
                <span className={styles.time}>{n.time}</span>
              </div>
            ))
          ) : (
            <div className={styles.empty}>
              <Bell size={24} className={styles.emptyIcon} />
              <p>Nenhuma notificação</p>
            </div>
          )}
        </div>
        
        <div className={styles.footer}>
          Marcar todas como lidas
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
