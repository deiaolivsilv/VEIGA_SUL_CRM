import React, { useState, useRef } from 'react';
import { HistoryItem, Attachment } from '../types';
import { Paperclip, X, FileText, Download, ExternalLink, Trash2 } from 'lucide-react';

interface Props {
  leadId: string;
  history?: HistoryItem[];
  onAddHistory: (item: HistoryItem) => void;
  onDeleteAttachment?: (historyId: string, attachmentId: string) => void;
}

export const LeadHistory: React.FC<Props> = ({ leadId, history = [], onAddHistory, onDeleteAttachment }) => {
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() && selectedFiles.length === 0) return;

    // Gera URLs válidas e seguras para cada arquivo selecionado
    const attachments: Attachment[] = selectedFiles.map((file) => {
      const isImage = file.type.startsWith('image/');
      return {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        url: URL.createObjectURL(file), // Objeto blob temporário
        type: isImage ? 'image' : file.type.includes('pdf') ? 'pdf' : 'document',
        size: file.size,
      };
    });

    const newHistoryItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      leadId,
      type: 'note',
      description,
      authorName: 'Usuário Atual',
      createdAt: new Date().toISOString(),
      attachments,
    };

    onAddHistory(newHistoryItem);
    setDescription('');
    setSelectedFiles([]);
  };

  return (
    <div style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', margin: 0 }}>Histórico de Atendimento e Anexos</h3>

      {/* Formulário para adicionar nova nota/interação */}
      <form onSubmit={handleSubmit} style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <textarea
          rows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Escreva uma anotação sobre a venda ou atendimento..."
          style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              multiple 
              style={{ display: 'none' }} 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 500, color: '#374151', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
            >
              <Paperclip size={16} color="#4b5563" />
              <span>Anexar Arquivo</span>
            </button>
          </div>

          <button
            type="submit"
            style={{ padding: '6px 16px', background: '#2563eb', color: '#fff', fontSize: '12px', fontWeight: 500, borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          >
            Adicionar Registro
          </button>
        </div>

        {/* Pré-visualização dos arquivos selecionados antes de salvar */}
        {selectedFiles.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
            {selectedFiles.map((file, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1px solid #e5e7eb', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: '#4b5563' }}>
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <button type="button" onClick={() => removeFile(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </form>

      {/* Listagem do Histórico existente com Anexos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
        {history.length === 0 ? (
          <p style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>Nenhum histórico registrado para este lead.</p>
        ) : (
          history.map(item => (
            <div key={item.id} style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af' }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>{item.authorName}</span>
                <span>{new Date(item.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#374151', margin: 0, whiteSpace: 'pre-wrap' }}>{item.description}</p>

              {/* Lista de anexos salvos com opção de exclusão individual */}
              {item.attachments && item.attachments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
                  {item.attachments.map(att => {
                    const isImg = att.type === 'image' || att.name.match(/\.(jpeg|jpg|png|webp|gif)$/i);
                    return (
                      <div 
                        key={att.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          background: '#f9fafb', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '6px', 
                          padding: '6px 10px',
                          fontSize: '12px'
                        }}
                      >
                        {/* Nome e ícone/miniatura do arquivo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                          {isImg ? (
                            <img src={att.url} alt={att.name} style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
                          ) : (
                            <FileText size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                          )}
                          <span style={{ color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                            {att.name}
                          </span>
                        </div>

                        {/* Botões de Ação: Visualizar, Baixar e Lixeira */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <a 
                            href={att.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            title="Visualizar arquivo"
                            style={{ color: '#2563eb', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                          >
                            <ExternalLink size={15} />
                          </a>
                          
                          <a 
                            href={att.url} 
                            download={att.name} 
                            title="Baixar arquivo"
                            style={{ color: '#16a34a', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                          >
                            <Download size={15} />
                          </a>

                          {onDeleteAttachment && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Deseja excluir apenas o arquivo "${att.name}"?`)) {
                                  onDeleteAttachment(item.id, att.id);
                                }
                              }}
                              title="Excluir este arquivo"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', padding: '2px' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};