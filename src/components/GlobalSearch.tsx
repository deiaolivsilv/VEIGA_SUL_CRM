import { useState, useEffect, useRef } from 'react';
import { Search, CornerDownLeft, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import styles from './GlobalSearch.module.css';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { leads } = useData();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery('');
      }
      
      // Close on Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small timeout to allow render before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = leads.filter(l => 
    l.name.toLowerCase().includes(query.toLowerCase()) || 
    l.company.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5); // show max 5 results

  const handleSelect = () => {
    setIsOpen(false);
    // Ideally we would navigate and open the modal, but just navigating to leads serves as a functional step
    navigate('/leads'); 
  };

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.searchHeader}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Buscar leads, empresas ou tarefas..." 
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className={styles.escBadge}>ESC</div>
        </div>
        
        {query.length > 0 && (
          <div className={styles.resultsList}>
            {results.length > 0 ? (
              results.map((lead) => (
                <div key={lead.id} className={styles.resultItem} onClick={() => handleSelect()}>
                  <div className={styles.resultIcon}>
                    <Building2 size={16} />
                  </div>
                  <div className={styles.resultDetails}>
                    <span className={styles.resultTitle}>{lead.name}</span>
                    <span className={styles.resultSub}>{lead.company} • Aba Leads</span>
                  </div>
                  <CornerDownLeft size={16} className={styles.enterIcon} />
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                Nenhum resultado encontrado para "{query}"
              </div>
            )}
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.hintText}>
            Utilize as setas para navegar, <strong>Enter</strong> para selecionar
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
