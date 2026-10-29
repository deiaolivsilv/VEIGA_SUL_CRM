export type Role = 'admin' | 'vendor';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
}

export type Stage = 
  | 'em contato'
  | 'pré-venda'
  | 'realizar orçamento'
  | 'orçamento finalizado'
  | 'negociação'
  | 'fechamento'
  | 'perda';

export interface Interaction {
  id: string;
  date: string;
  note: string;
  authorId: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  stage: Stage;
  value: number; // For pipeline revenue
  assignedToId: string;
  source?: string;
  notes?: string;
  interactions?: Interaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  start: string; // ISO string 
  end: string;   // ISO string
  leadId?: string;
  assignedToId: string;
}
