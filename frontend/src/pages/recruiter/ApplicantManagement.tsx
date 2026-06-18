/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

type ApplicationType = Record<string, any>;

const STATUSES = [
  'Applied', 
  'Screening', 
  'Shortlisted', 
  'Technical Interview', 
  'HR Interview', 
  'Offer Extended', 
  'Hired', 
  'Rejected'
];

const ApplicantManagement = () => {
  const { activeOrganization } = useAuthStore();
  const { jobId } = useParams<{ jobId: string }>();
  const [applicants, setApplicants] = useState<ApplicationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicationType | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  const fetchApplicants = useCallback(async () => {
    if (!activeOrganization) return;
    try {
      const url = jobId 
        ? `/api/recruiter/applicants?organization_id=${activeOrganization.id}&job_id=${jobId}` 
        : `/api/recruiter/applicants?organization_id=${activeOrganization.id}`;
      const response = await apiClient.get(url);
      setApplicants(response.data);
    } catch (error) {
      console.error("Error fetching applicants", error);
    } finally {
      setLoading(false);
    }
  }, [activeOrganization, jobId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleStatusUpdate = async (appId: number, newStatus: string) => {
    try {
      await apiClient.patch(`/api/applications/${appId}/status`, { status: newStatus, current_stage: newStatus });
      toast.success("Status updated");
      if (selectedApplicant && selectedApplicant.id === appId) {
        setSelectedApplicant({ ...selectedApplicant, status: newStatus });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
      // Revert optimistic update
      fetchApplicants();
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const appId = parseInt(draggableId.split('-')[1]);
    const newStatus = destination.droppableId;

    // Optimistically update UI
    setApplicants(prev => {
      const updated = [...prev];
      const index = updated.findIndex(a => a.id === appId);
      if (index !== -1) {
        updated[index] = { ...updated[index], status: newStatus };
      }
      return updated;
    });

    handleStatusUpdate(appId, newStatus);
  };

  const scheduleInterview = async (appId: number, dateStr: string, meetLink: string) => {
    try {
      const isUpdate = selectedApplicant?.interview_date;
      const payload = {
        application_id: appId,
        date: new Date(dateStr).toISOString(),
        mode: "Google Meet",
        meet_link: meetLink,
        duration: 60
      };
      
      if (isUpdate) {
        await apiClient.patch(`/api/applications/${appId}/interview`, payload);
      } else {
        await apiClient.post(`/api/applications/${appId}/interview`, payload);
      }
      
      toast.success("Interview scheduled successfully!");
      fetchApplicants();
      
      if (selectedApplicant && selectedApplicant.id === appId) {
        setSelectedApplicant({ ...selectedApplicant, interview_date: payload.date });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to schedule interview");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4ade80';
    if (score >= 60) return '#facc15';
    return '#f87171';
  };

  const renderBoardView = () => {
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', height: 'calc(100vh - 200px)' }}>
          {STATUSES.map(status => {
            const columnApplicants = applicants.filter(a => a.status === status);
            return (
              <div key={status} style={{ display: 'flex', flexDirection: 'column', minWidth: '300px', background: 'var(--bg-card, #111315)', borderRadius: '12px', border: '1px solid var(--border-color, #222)' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color, #222)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ color: 'var(--text-primary, white)', fontWeight: 'bold' }}>{status}</h3>
                  <span style={{ background: 'var(--bg-secondary, #222)', color: 'var(--text-secondary, #888)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{columnApplicants.length}</span>
                </div>
                
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      style={{ 
                        flex: 1, 
                        padding: '16px', 
                        overflowY: 'auto',
                        background: snapshot.isDraggingOver ? 'var(--bg-glass, rgba(255,255,255,0.02))' : 'transparent',
                        transition: 'background 0.2s'
                      }}
                    >
                      {columnApplicants.map((app, index) => (
                        <Draggable key={`app-${app.id}`} draggableId={`app-${app.id}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedApplicant(app)}
                              style={{
                                ...provided.draggableProps.style,
                                background: snapshot.isDragging ? 'var(--border-color, #222)' : 'var(--bg-secondary, #1a1d21)',
                                padding: '16px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color-light, #333)',
                                marginBottom: '12px',
                                boxShadow: snapshot.isDragging ? 'var(--shadow-md)' : 'none',
                                cursor: 'grab',
                                transform: snapshot.isDragging ? provided.draggableProps.style?.transform : 'translate(0, 0)'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-primary, white)', fontWeight: 'bold' }}>
                                  {app.candidate?.user?.name || `Candidate #${app.candidate_id}`}
                                </span>
                                <span style={{ 
                                  color: getScoreColor(app.candidate_score || 0), 
                                  fontSize: '0.8rem',
                                  fontWeight: 'bold',
                                  background: 'var(--bg-glass)',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}>
                                  {app.candidate_score || 0}%
                                </span>
                              </div>
                              {app.job && <p style={{ color: 'var(--text-secondary, #888)', fontSize: '0.85rem', marginBottom: '8px' }}>{app.job.title}</p>}
                              <p style={{ color: 'var(--text-muted, #666)', fontSize: '0.8rem' }}>Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    );
  };

  const renderListView = () => {
    return (
      <div style={{ background: 'var(--bg-card, #111315)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary, white)', textAlign: 'left' }}>
          <thead style={{ background: 'var(--bg-secondary, #1a1d21)', borderBottom: '1px solid var(--border-color-light, #333)' }}>
            <tr>
              <th style={{ padding: '16px', color: 'var(--text-secondary, #888)', fontWeight: 'normal' }}>Candidate</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary, #888)', fontWeight: 'normal' }}>Job</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary, #888)', fontWeight: 'normal' }}>Match Score</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary, #888)', fontWeight: 'normal' }}>Current Stage</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary, #888)', fontWeight: 'normal' }}>Applied On</th>
              <th style={{ padding: '16px', color: 'var(--text-secondary, #888)', fontWeight: 'normal' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid var(--border-color, #222)', background: selectedApplicant?.id === app.id ? 'var(--bg-secondary, #1a1d21)' : 'transparent' }}>
                <td style={{ padding: '16px', fontWeight: 'bold' }}>{app.candidate?.user?.name || `Candidate #${app.candidate_id}`}</td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{app.job?.title}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ color: getScoreColor(app.candidate_score || 0), fontWeight: 'bold', padding: '4px 8px', background: 'var(--bg-glass)', borderRadius: '4px' }}>
                    {app.candidate_score || 0}/100
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color-light)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    {app.status}
                  </span>
                </td>
                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{new Date(app.applied_at).toLocaleDateString()}</td>
                <td style={{ padding: '16px' }}>
                  <button onClick={() => setSelectedApplicant(app)} style={{ background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6" style={{ display: 'flex', gap: '24px' }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div className="flex justify-between items-center mb-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary, white)' }}>Applicant Pipeline</h1>
            <div style={{ background: 'var(--bg-card, #111315)', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px', border: '1px solid var(--border-color, #222)' }}>
              <button 
                onClick={() => setViewMode('board')} 
                style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: viewMode === 'board' ? 'var(--border-color, #222)' : 'transparent', color: viewMode === 'board' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: viewMode === 'board' ? 'bold' : 'normal' }}
              >Board</button>
              <button 
                onClick={() => setViewMode('list')} 
                style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: viewMode === 'list' ? 'var(--border-color, #222)' : 'transparent', color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: viewMode === 'list' ? 'bold' : 'normal' }}
              >List</button>
            </div>
          </div>
          {jobId && <Link to="/dashboard/jobs" style={{ color: 'var(--text-secondary, #888)', textDecoration: 'none' }}>&larr; Back to Jobs</Link>}
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading pipeline...</p>
        ) : applicants.length === 0 ? (
          <div style={{ padding: '40px', background: 'var(--bg-card)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No applicants found.
          </div>
        ) : (
          viewMode === 'board' ? renderBoardView() : renderListView()
        )}
      </div>

      {selectedApplicant && (
        <div style={{ width: '400px', background: 'var(--bg-card, #111315)', borderRadius: '12px', padding: '24px', color: 'var(--text-primary, white)', border: '1px solid var(--border-color-light, #333)', overflowY: 'auto', height: 'calc(100vh - 80px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color-light, #333)', paddingBottom: '16px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{selectedApplicant.candidate?.user?.name || 'Applicant'}</h2>
            <button onClick={() => setSelectedApplicant(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: 'var(--text-secondary, #888)', marginBottom: '4px' }}>Job</p>
            <p style={{ color: 'var(--text-primary, white)', fontWeight: 'bold' }}>{selectedApplicant.job?.title}</p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: 'var(--text-secondary, #888)', marginBottom: '4px' }}>Match Score</p>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getScoreColor(selectedApplicant.candidate_score || 0) }}>
              {selectedApplicant.candidate_score || 0}/100
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: 'var(--text-secondary, #888)', marginBottom: '8px' }}>Pipeline Status</p>
            <select 
              value={selectedApplicant.status} 
              onChange={(e) => {
                const newStatus = e.target.value;
                setApplicants(prev => {
                  const updated = [...prev];
                  const index = updated.findIndex(a => a.id === selectedApplicant.id);
                  if (index !== -1) updated[index] = { ...updated[index], status: newStatus };
                  return updated;
                });
                handleStatusUpdate(selectedApplicant.id, newStatus);
              }}
              style={{ width: '100%', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color-light)', color: 'var(--text-primary)', borderRadius: '8px' }}
            >
              {STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>

          {(selectedApplicant.status === 'Technical Interview' || selectedApplicant.status === 'HR Interview') && (
            <div style={{ marginBottom: '24px', background: 'var(--bg-secondary, #1a1d21)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color-light, #333)' }}>
              <p style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '12px' }}>Interview Scheduling</p>
              {selectedApplicant.interview_date ? (
                <div>
                  <p style={{ color: 'var(--success, #4ade80)', fontSize: '0.9rem', marginBottom: '8px' }}>✓ Scheduled for {new Date(selectedApplicant.interview_date).toLocaleString()}</p>
                  <button 
                    onClick={() => {
                      const meetLink = prompt("Update Google Meet Link:");
                      const dateStr = prompt("Update Date/Time (YYYY-MM-DDTHH:MM):", new Date(selectedApplicant.interview_date).toISOString().slice(0, 16));
                      if (dateStr && meetLink) scheduleInterview(selectedApplicant.id, dateStr, meetLink);
                    }}
                    style={{ background: 'var(--border-color-light)', border: 'none', color: 'var(--text-primary)', padding: '8px', borderRadius: '4px', width: '100%', cursor: 'pointer' }}
                  >Reschedule</button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    const meetLink = prompt("Google Meet Link:");
                    const dateStr = prompt("Date/Time (YYYY-MM-DDTHH:MM):");
                    if (dateStr && meetLink) scheduleInterview(selectedApplicant.id, dateStr, meetLink);
                  }}
                  style={{ background: 'var(--accent-primary)', border: 'none', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', cursor: 'pointer', fontWeight: 'bold' }}
                >Schedule Now</button>
              )}
            </div>
          )}

          {selectedApplicant.resume_snapshot_url && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: 'var(--text-secondary, #888)', marginBottom: '8px' }}>Resume</p>
              <a href={selectedApplicant.resume_snapshot_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color-light)', color: 'var(--accent-primary)', textAlign: 'center', borderRadius: '8px', textDecoration: 'none' }}>
                View Original Resume PDF
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicantManagement;
