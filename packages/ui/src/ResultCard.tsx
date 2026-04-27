import React from 'react';

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, children }) => {
  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#f8fafc',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      margin: '20px 0'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#334155' }}>{title}</h3>
      <div style={{ color: '#475569', fontSize: '1.1rem' }}>
        {children}
      </div>
    </div>
  );
};