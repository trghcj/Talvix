import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const RecruiterDashboard = () => {
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Recruiter Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your job postings and review candidates.</p>
        </div>
        <Button>+ Post New Job</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            💼
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>ACTIVE JOBS</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>0</p>
          </div>
        </Card>
        <Card padding="sm" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
            👥
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>APPLICANTS</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>0</p>
          </div>
        </Card>
      </div>

      <Card>
        <h3 style={{ marginBottom: '1rem', fontWeight: 500 }}>Recent Job Postings</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>You haven't posted any jobs yet.</p>
      </Card>
    </div>
  );
};
