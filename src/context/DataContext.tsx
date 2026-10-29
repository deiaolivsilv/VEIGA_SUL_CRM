/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Lead, Event } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { subDays, subMonths, setHours, setMinutes } from 'date-fns';
import { useAuth } from './AuthContext';
import { addAuditLog } from '../utils/audit';

interface DataContextType {
  leads: Lead[];
  allLeads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;

  events: Event[];
  allEvents: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const d = (daysAgo: number) => subDays(new Date(), daysAgo).toISOString();
const m = (monthsAgo: number) => subMonths(new Date(), monthsAgo).toISOString();

const generateMockLeads = (): Lead[] => [
  // ANA LIMA (u2)
  { id: uuidv4(), name: 'João Pereira', company: 'MetalTech Ltda', email: 'joao@metaltech.com', phone: '(48) 99912-3456', assignedToId: 'u2', stage: 'pré-venda', value: 45000, source: 'Indicação', createdAt: d(2), updatedAt: d(2) },
  { id: uuidv4(), name: 'Maria Souza', company: 'AgroIndustrial SA', email: 'maria@agroindustrial.com', phone: '(48) 99834-5678', assignedToId: 'u2', stage: 'fechamento', value: 78000, source: 'Site', createdAt: d(10), updatedAt: d(5) },
  { id: uuidv4(), name: 'Fernanda Alves', company: 'TextilBR', email: 'fernanda@textilbr.com', phone: '(48) 99678-1234', assignedToId: 'u2', stage: 'orçamento finalizado', value: 35000, source: 'Google Ads', createdAt: d(20), updatedAt: d(15) },
  { id: uuidv4(), name: 'Sônia Vargas', company: 'Aço Premium SC', email: 'sonia@acopremium.com', phone: '(48) 98234-5678', assignedToId: 'u2', stage: 'negociação', value: 92000, source: 'Feira', createdAt: m(1), updatedAt: m(1) },
  { id: uuidv4(), name: 'Tiago Ramos', company: 'Madeireira Norte', email: 'tiago@madeiranorte.com', phone: '(48) 97123-4567', assignedToId: 'u2', stage: 'em contato', value: 18000, source: 'LinkedIn', createdAt: m(2), updatedAt: m(2) },
  { id: uuidv4(), name: 'Beatriz Leal', company: 'Couro & Design', email: 'beatriz@courod.com', phone: '(48) 96012-3456', assignedToId: 'u2', stage: 'perda', value: 55000, source: 'Site', createdAt: m(3), updatedAt: m(3) },

  // CARLOS MELO (u3)
  { id: uuidv4(), name: 'Pedro Lima', company: 'ConstruMax', email: 'pedro@construmax.com', phone: '(48) 99756-7890', assignedToId: 'u3', stage: 'realizar orçamento', value: 120000, source: 'LinkedIn', createdAt: d(1), updatedAt: d(1) },
  { id: uuidv4(), name: 'André Costa', company: 'Química Avançada', email: 'andre@quimica.com', phone: '(48) 99178-6789', assignedToId: 'u3', stage: 'em contato', value: 88000, source: 'Google Ads', createdAt: d(8), updatedAt: d(8) },
  { id: uuidv4(), name: 'Cláudia Monteiro', company: 'Plásticos Fast', email: 'claudia@plasticosfast.com', phone: '(48) 98765-4321', assignedToId: 'u3', stage: 'fechamento', value: 243000, source: 'Feira', createdAt: d(15), updatedAt: d(12) },
  { id: uuidv4(), name: 'Rafael Nunes', company: 'Engenharia BR', email: 'rafael@engbr.com', phone: '(48) 97654-3210', assignedToId: 'u3', stage: 'negociação', value: 67000, source: 'Indicação', createdAt: m(1), updatedAt: m(1) },
  { id: uuidv4(), name: 'Luiz Henrique', company: 'Vidros Curitiba', email: 'luiz@vidroscuritiba.com', phone: '(48) 96543-2109', assignedToId: 'u3', stage: 'orçamento finalizado', value: 34000, source: 'Site', createdAt: m(2), updatedAt: m(2) },
  { id: uuidv4(), name: 'Simone Rocha', company: 'Cerâmicas RS', email: 'simone@ceramicars.com', phone: '(48) 95432-1098', assignedToId: 'u3', stage: 'perda', value: 49000, source: 'Google Ads', createdAt: m(4), updatedAt: m(4) },

  // ROBERTO ALVES (u4)
  { id: uuidv4(), name: 'Lucas Mendes', company: 'Siderúrgica Sul', email: 'lucas@siderurgica.com', phone: '(48) 99590-2345', assignedToId: 'u4', stage: 'negociação', value: 250000, source: 'Feira', createdAt: d(3), updatedAt: d(3) },
  { id: uuidv4(), name: 'Patricia Dias', company: 'Energia Solar Sul', email: 'patricia@energia.com', phone: '(48) 99090-7890', assignedToId: 'u4', stage: 'realizar orçamento', value: 155000, source: 'LinkedIn', createdAt: d(12), updatedAt: d(10) },
  { id: uuidv4(), name: 'Eduardo Brito', company: 'Maquinários RS', email: 'eduardo@maquinrrs.com', phone: '(48) 98901-2345', assignedToId: 'u4', stage: 'fechamento', value: 310000, source: 'Indicação', createdAt: d(25), updatedAt: d(20) },
  { id: uuidv4(), name: 'Vanessa Rocha', company: 'Equipamentos Top', email: 'vanessa@equiptop.com', phone: '(48) 97890-1234', assignedToId: 'u4', stage: 'em contato', value: 42000, source: 'Site', createdAt: m(1), updatedAt: m(1) },
  { id: uuidv4(), name: 'Marcos Vilas', company: 'Metal União', email: 'marcos@metaluniao.com', phone: '(48) 96789-0123', assignedToId: 'u4', stage: 'perda', value: 85000, source: 'Google Ads', createdAt: m(3), updatedAt: m(3) },

  // JULIANA PIRES (u5)
  { id: uuidv4(), name: 'Camila Rocha', company: 'Alimentos Premium', email: 'camila@alimentos.com', phone: '(48) 99412-3456', assignedToId: 'u5', stage: 'fechamento', value: 95000, source: 'Site', createdAt: d(5), updatedAt: d(3) },
  { id: uuidv4(), name: 'Alexandre Ferreira', company: 'BioEnergy SC', email: 'alex@bioenergy.com', phone: '(48) 98312-3456', assignedToId: 'u5', stage: 'pré-venda', value: 72000, source: 'LinkedIn', createdAt: d(18), updatedAt: d(15) },
  { id: uuidv4(), name: 'Gisele Torres', company: 'Hospitalar Norte', email: 'gisele@hospitalarnorte.com', phone: '(48) 97212-3456', assignedToId: 'u5', stage: 'orçamento finalizado', value: 130000, source: 'Indicação', createdAt: m(1), updatedAt: m(1) },
  { id: uuidv4(), name: 'Renata Oliveira', company: 'FoodTech Brasil', email: 'renata@foodtechbr.com', phone: '(48) 96112-3456', assignedToId: 'u5', stage: 'negociação', value: 58000, source: 'Google Ads', createdAt: m(2), updatedAt: m(2) },
  { id: uuidv4(), name: 'Thiago Ramos', company: 'Eletro Industrial', email: 'thiago@eletrind.com', phone: '(48) 95012-3456', assignedToId: 'u5', stage: 'perda', value: 38000, source: 'Feira', createdAt: m(5), updatedAt: m(5) },

  // FERNANDA COSTA (u6)
  { id: uuidv4(), name: 'Juliana Torres', company: 'Plásticos Inovação', email: 'juliana@plasticos.com', phone: '(48) 99256-5678', assignedToId: 'u6', stage: 'pré-venda', value: 62000, source: 'Instagram', createdAt: d(4), updatedAt: d(4) },
  { id: uuidv4(), name: 'Ricardo Neto', company: 'Mineradora Central', email: 'ricardo@mineradora.com', phone: '(48) 99334-4567', assignedToId: 'u6', stage: 'perda', value: 180000, source: 'Indicação', createdAt: d(14), updatedAt: d(14) },
  { id: uuidv4(), name: 'Bruno Cavalcanti', company: 'VeícTrans SC', email: 'bruno@veictrans.com', phone: '(48) 98234-6789', assignedToId: 'u6', stage: 'realizar orçamento', value: 89000, source: 'Site', createdAt: m(1), updatedAt: m(1) },
  { id: uuidv4(), name: 'Mariana Xavier', company: 'Têxtil Sul', email: 'mariana@textilsul.com', phone: '(48) 97134-7890', assignedToId: 'u6', stage: 'fechamento', value: 77138, source: 'LinkedIn', createdAt: m(2), updatedAt: m(2) },
  { id: uuidv4(), name: 'Samuel Fonseca', company: 'Agro Oeste', email: 'samuel@agrooeste.com', phone: '(48) 96034-8901', assignedToId: 'u6', stage: 'em contato', value: 33000, source: 'Google Ads', createdAt: m(3), updatedAt: m(3) },
];

const generateMockEvents = (leads: Lead[]): Event[] => {
  const mkDate = (daysOff: number, h: number) =>
    setMinutes(setHours(subDays(new Date(), -daysOff), h), 0).toISOString();

  return [
    { id: uuidv4(), title: 'Reunião de Apresentação', start: mkDate(2, 10), end: mkDate(2, 11), assignedToId: 'u2', leadId: leads[0].id, description: 'Apresentar catálogo de máquinas' },
    { id: uuidv4(), title: 'Visita Técnica', start: mkDate(3, 14), end: mkDate(3, 16), assignedToId: 'u4', leadId: leads[12].id, description: 'Avaliar espaço físico para instalação' },
    { id: uuidv4(), title: 'Negociação Contratual', start: mkDate(0, 15), end: mkDate(0, 16), assignedToId: 'u3', leadId: leads[7].id, description: 'Discutir termos de pagamento' },
    { id: uuidv4(), title: 'Alinhamento Inicial', start: mkDate(1, 9), end: mkDate(1, 10), assignedToId: 'u2', leadId: leads[1].id, description: 'Call de 30 mins' },
    { id: uuidv4(), title: 'Assinatura de Contrato', start: mkDate(5, 11), end: mkDate(5, 12), assignedToId: 'u5', leadId: leads[18].id, description: 'Fechamento presencial' },
    { id: uuidv4(), title: 'Demo do Produto', start: mkDate(1, 14), end: mkDate(1, 15), assignedToId: 'u6', leadId: leads[24].id, description: 'Demonstração remota via Teams' },
    { id: uuidv4(), title: 'Follow-up Proposta', start: mkDate(7, 10), end: mkDate(7, 11), assignedToId: 'u3', leadId: leads[9].id, description: 'Retorno sobre proposta enviada' },
    { id: uuidv4(), title: 'Apresentação Executiva', start: mkDate(10, 9), end: mkDate(10, 11), assignedToId: 'u4', leadId: leads[14].id, description: 'Para diretoria da empresa cliente' },
  ];
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('veiga-leads-v2');
    if (saved) return JSON.parse(saved);
    const mock = generateMockLeads();
    localStorage.setItem('veiga-leads-v2', JSON.stringify(mock));
    return mock;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('veiga-events-v2');
    if (saved) return JSON.parse(saved);
    const mock = generateMockEvents(leads);
    localStorage.setItem('veiga-events-v2', JSON.stringify(mock));
    return mock;
  });

  useEffect(() => {
    localStorage.setItem('veiga-leads-v2', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('veiga-events-v2', JSON.stringify(events));
  }, [events]);

  const addLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeads([...leads, newLead]);
    addAuditLog(user?.name || 'Sistema', 'Novo lead criado', `${lead.company} (${lead.name})`, 'create');
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    const target = leads.find(l => l.id === id);
    setLeads(leads.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
    addAuditLog(user?.name || 'Sistema', 'Lead atualizado', `${target?.company || ''} (${updates.stage ? 'Estágio: ' + updates.stage : 'Dados atualizados'})`, 'edit');
  };

  const deleteLead = (id: string) => {
    const target = leads.find(l => l.id === id);
    setLeads(leads.filter(l => l.id !== id));
    addAuditLog(user?.name || 'Sistema', 'Lead excluído', `${target?.company || ''} (${target?.name || ''})`, 'delete');
  };

  const addEvent = (event: Omit<Event, 'id'>) => {
    setEvents([...events, { ...event, id: uuidv4() }]);
    addAuditLog(user?.name || 'Sistema', 'Novo evento criado', `${event.title}`, 'create');
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    const target = events.find(e => e.id === id);
    setEvents(events.map(e => e.id === id ? { ...e, ...updates } : e));
    addAuditLog(user?.name || 'Sistema', 'Evento atualizado', `${target?.title || ''} → ${updates.title || ''}`, 'edit');
  };

  const deleteEvent = (id: string) => {
    const target = events.find(e => e.id === id);
    setEvents(events.filter(e => e.id !== id));
    addAuditLog(user?.name || 'Sistema', 'Evento excluído', `${target?.title || ''}`, 'delete');
  };

  const visibleLeads = useMemo(() => {
    if (!user || user.role === 'admin') return leads;
    return leads.filter(l => l.assignedToId === user.id);
  }, [leads, user]);

  const visibleEvents = useMemo(() => {
    if (!user || user.role === 'admin') return events;
    return events.filter(e => e.assignedToId === user.id);
  }, [events, user]);

  return (
    <DataContext.Provider value={{
      leads: visibleLeads,
      allLeads: leads,
      addLead,
      updateLead,
      deleteLead,
      events: visibleEvents,
      allEvents: events,
      addEvent,
      updateEvent,
      deleteEvent
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
