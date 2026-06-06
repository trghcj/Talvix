import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  padding = 'md'
}) => {
  return (
    <div className={`card glass-panel card-pad-${padding} ${className}`.trim()}>
      {children}
    </div>
  );
};
