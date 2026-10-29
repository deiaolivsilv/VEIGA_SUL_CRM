import { useState, useMemo } from 'react';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, parseISO, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useData } from '../context/DataContext';
import { useAuth, MOCK_USERS } from '../context/AuthContext';
import styles from './Agenda.module.css';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../components/Modal';
import { Event } from '../types';


const Agenda = () => {
  const { events, addEvent, leads } = useData();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<Event>>({});

  const nextMonth = () => setCurrentDate(addDays(currentDate, 30));
  const prevMonth = () => setCurrentDate(addDays(currentDate, -30));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        
        // Check if there are events on this day
        const hasEvents = events.some(e => isSameDay(parseISO(e.start), cloneDay));

        days.push(
          <div
            className={`${styles.colCell} ${
              !isSameMonth(day, monthStart)
                ? styles.disabled
                : isSameDay(day, selectedDate) ? styles.selected : ''
            }`}
            key={day.toString()}
            onClick={() => isSameMonth(cloneDay, monthStart) && setSelectedDate(cloneDay)}
          >
            <span className={styles.number}>{formattedDate}</span>
            {hasEvents && <div className={styles.eventDot}></div>}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className={styles.row} key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className={styles.body}>{rows}</div>;
  };

  const dayEvents = useMemo(() => {
    return events.filter(e => isSameDay(parseISO(e.start), selectedDate));
  }, [events, selectedDate]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const filtered = [...events].filter(e => isAfter(parseISO(e.start), today));
    return filtered
      .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
      .slice(0, 8);
  }, [events]);

  const openAddModal = () => {
    const now = selectedDate;
    const start = new Date(now);
    start.setHours(12, 0, 0); // default noon
    const end = new Date(start);
    end.setHours(start.getHours() + 1);
    
    setCurrentEvent({
      start: start.toISOString().slice(0, 16),
      end: end.toISOString().slice(0, 16),
      assignedToId: user?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentEvent.title && currentEvent.start && currentEvent.end) {
      addEvent(currentEvent as Omit<Event, 'id'>);
      setIsModalOpen(false);
    }
  };

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Agenda & Compromissos</h1>
          <p className={styles.subtitle}>Planeje seu dia e acompanhe suas reuniões</p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.addBtn} onClick={openAddModal}>
            <Plus size={18} /> Agendar Compromisso
          </button>
        </div>
      </header>

      <div className={styles.contentGrid}>
        
        {/* Left Column */}
        <div className={styles.leftCol}>
          <div className={styles.calendarWidget}>
            <div className={styles.calHeader}>
              <button onClick={prevMonth}><ChevronLeft size={16}/></button>
              <span>{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</span>
              <button onClick={nextMonth}><ChevronRight size={16}/></button>
            </div>
            <div className={styles.daysRow}>
              {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map(d => <div key={d} className={styles.customContainer}>{d}</div>)}
            </div>
            {renderCells()}
          </div>

          <div className={styles.upcomingSection}>
            <h3 className={styles.upcomingTitle}>Próximos Dias</h3>
            <div className={styles.upcomingList}>
              {upcomingEvents.length === 0 ? (
                 <p className={styles.noUpcoming}>Nenhum evento próximo.</p>
              ) : (
                upcomingEvents.map(e => (
                  <div key={e.id} className={styles.upcomingCard}>
                    <div className={styles.upDateBox}>
                      <span className={styles.upMonth}>{format(parseISO(e.start), 'MMM', { locale: ptBR }).toUpperCase()}</span>
                      <span className={styles.upDay}>{format(parseISO(e.start), 'dd')}</span>
                    </div>
                    <div className={styles.upInfo}>
                      <h4>{e.title}</h4>
                      <p>{format(parseISO(e.start), 'HH:mm')} • {MOCK_USERS.find(u => u.id === e.assignedToId)?.name.split(' ')[0]}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightCol}>
          <div className={styles.dayHeader}>
            <h2 className={styles.dayTitle}>
              {isToday ? 'Hoje' : format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h2>
            <span className={styles.dayBadge}>{isToday ? 'Dia Atual' : format(selectedDate, 'EEEE', { locale: ptBR })}</span>
          </div>
          
          <p className={styles.daySubtitle}>
            {dayEvents.length === 0 ? 'Nenhum compromisso agendado para este dia' : `${dayEvents.length} compromisso(s) agendado(s) para este dia`}
          </p>

          <div className={styles.dayContent}>
            {dayEvents.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>☕</div>
                <h3>Sua agenda está livre!</h3>
                <p>Tire um tempo para organizar seus afazeres ou prospectar novos clientes.</p>
                <button className={styles.emptyBtn} onClick={openAddModal}>
                  <Plus size={16} /> Adicionar Evento
                </button>
              </div>
            ) : (
              <div className={styles.eventsList}>
                {dayEvents.map(e => (
                  <div key={e.id} className={styles.eventItem}>
                    <div className={styles.eventTimeLine}>
                      <span className={styles.eventTime}>{format(parseISO(e.start), 'HH:mm')}</span>
                      <div className={styles.eventDotLine}></div>
                    </div>
                    <div className={styles.eventDetails}>
                      <h4>{e.title}</h4>
                      <p>{e.description}</p>
                      <div>
                        {e.leadId && <span className={styles.eventLeadRef}>Lead: {leads.find(l=>l.id===e.leadId)?.name}</span>}
                        <span className={styles.eventVendorTag}>{MOCK_USERS.find(u => u.id === e.assignedToId)?.name || 'Sem responsável'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Compromisso"
        footer={
          <>
            <button className={styles.btnSecondary} onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className={styles.addBtn} form="eventForm" type="submit">Salvar</button>
          </>
        }
      >
        <form id="eventForm" onSubmit={handleSaveEvent} className={styles.formGrid}>
          <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
            <label>Título</label>
            <input required type="text" value={currentEvent.title || ''} onChange={e => setCurrentEvent({...currentEvent, title: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label>Início</label>
            <input required type="datetime-local" value={currentEvent.start || ''} onChange={e => setCurrentEvent({...currentEvent, start: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label>Término</label>
            <input required type="datetime-local" value={currentEvent.end || ''} onChange={e => setCurrentEvent({...currentEvent, end: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label>Lead Associado (Opcional)</label>
            <select value={currentEvent.leadId || ''} onChange={e => setCurrentEvent({...currentEvent, leadId: e.target.value})}>
              <option value="">Nenhum...</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.name} - {l.company}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Responsável</label>
            <select required value={currentEvent.assignedToId || ''} onChange={e => setCurrentEvent({...currentEvent, assignedToId: e.target.value})}>
              <option value="">Selecione...</option>
              {MOCK_USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
            <label>Descrição</label>
            <textarea rows={3} value={currentEvent.description || ''} onChange={e => setCurrentEvent({...currentEvent, description: e.target.value})}></textarea>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Agenda;
