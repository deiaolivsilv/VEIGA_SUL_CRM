// Tipos de Etapas do Funil
export type Stage = 
  | 'em contato' 
  | 'pré-venda' 
  | 'realizar orçamento' 
  | 'orçamento finalizado' 
  | 'negociação' 
  | 'fechamento' 
  | 'perda';

// Tipos de Anexos do Histórico
export type AttachmentType = 'image' | 'pdf' | 'document' | 'spreadsheet' | 'other';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: AttachmentType;
  size?: number;
}

// Histórico de Atendimento / Linha do Tempo do Lead
export interface HistoryItem {
  id: string;
  leadId: string;
  type: 'note' | 'call' | 'email' | 'status_change';
  description: string;
  authorName: string;
  createdAt: string;
  attachments?: Attachment[];
}

// Estrutura de Endereço Completa
export interface Address {
  street?: string;
  number?: string;
  city?: string;
  stateOrProvince?: string;
  postalCode?: string;
  country?: string;
}

// Tipagem de Usuário / Vendedor
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'vendedor' | string;
  email?: string;
}

// Tipagem Completa do Lead
export interface Lead {
  id: string;
  name: string;          // Nome do Lead / Contato
  company: string;       // Empresa
  email?: string;
  phone?: string;
  
  // Identificação Fiscal e Endereço (Nacional / Internacional)
  cnpj?: string;
  taxId?: {
    type: string;
    number: string;
  };
  city?: string;
  address?: Address;

  // Dados de Vendas e CRM
  assignedToId: string;  // ID do Vendedor responsável
  stage: Stage;          // Etapa obrigatória do Lead
  value: number;         // Valor estimado
  source?: string;       // Canal de Origem
  notes?: string;        // Notas adicionais
  currency?: 'BRL' | 'USD';
  // Histórico de interações com anexos
  history?: HistoryItem[];

  // Metadados
  createdAt?: string;
  updatedAt?: string;
}