/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

type ApplicationType = Record<string, any>;

const ApplicantManagement = () => {
  const { activeOrganization } = useAuthStore();
  const { jobId } = useParams<{ jobId: string }>();
  const [applicants, setApplicants] = useState<ApplicationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicationType | null>(null);

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
      fetchApplicants();
      if (selectedApplicant && selectedApplicant.id === appId) {
        setSelectedApplicant({ ...selectedApplicant, status: newStatus });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const scheduleInterview = async (appId: number, dateStr: string, meetLink: string) => {
    try {
      // Create or update interview
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
      
      // Update local state temporarily so UI reflects the change immediately
      if (selectedApplicant && selectedApplicant.id === appId) {
        setSelectedApplicant({ ...selectedApplicant, interview_date: payload.date });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to schedule interview");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4ade80'; // Green
    if (score >= 60) return '#facc15'; // Yellow
    return '#f87171'; // Red
  };

  return (
    <div className="p-6" style={{ display: 'flex', gap: '24px' }}>
      <div style={{ flex: 1 }}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'white' }}>Applicant Tracking</h1>
          {jobId && <Link to="/dashboard/jobs" style={{ color: '#888', textDecoration: 'none' }}>&larr; Back to Jobs</Link>}
        </div>

        {loading ? (
          <p style={{ color: '#888' }}>Loading applicants...</p>
        ) : applicants.length === 0 ? (
          <div style={{ padding: '40px', background: '#111315', borderRadius: '12px', textAlign: 'center', color: '#888' }}>
            No applicants found.
          </div>
        ) : (
          <div style={{ background: '#111315', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', textAlign: 'left' }}>
              <thead style={{ background: '#1a1d21', borderBottom: '1px solid #333' }}>
                <tr>
                  <th style={{ padding: '16px', color: '#888', fontWeight: 'normal' }}>Candidate ID</th>
                  <th style={{ padding: '16px', color: '#888', fontWeight: 'normal' }}>Match Score</th>
                  <th style={{ padding: '16px', color: '#888', fontWeight: 'normal' }}>Current Stage</th>
                  <th style={{ padding: '16px', color: '#888', fontWeight: 'normal' }}>Applied On</th>
                  <th style={{ padding: '16px', color: '#888', fontWeight: 'normal' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid #222', background: selectedApplicant?.id === app.id ? '#1a1d21' : 'transparent' }}>
                    <td style={{ padding: '16px', fontWeight: 'bold' }}>#{app.candidate_id}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        color: getScoreColor(app.candidate_score || 0), 
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '4px'
                      }}>
                        {app.candidate_score || 0}/100
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ color: '#ccc', border: '1px solid #333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#888' }}>{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td style={{ padding: '16px' }}>
                      <button 
                        onClick={() => setSelectedApplicant(app)}
                        style={{ background: 'transparent', border: '1px solid #6366f1', color: '#6366f1', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Applicant Detail Drawer / Pane */}
      {selectedApplicant && (
        <div style={{ width: '400px', background: '#111315', borderRadius: '12px', padding: '24px', color: 'white', border: '1px solid #333' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '16px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Application Details</h2>
            <button onClick={() => setSelectedApplicant(null)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: '#888', marginBottom: '4px' }}>Match Score</p>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getScoreColor(selectedApplicant.candidate_score || 0) }}>
              {selectedApplicant.candidate_score || 0}/100
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: '#888', marginBottom: '8px' }}>Update Status Pipeline</p>
            <select 
              value={selectedApplicant.status} 
              onChange={(e) => handleStatusUpdate(selectedApplicant.id, e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#090a0b', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
            >
              <option value="Applied">Applied</option>
              <option value="Screening">Screening</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Technical Interview">Technical Interview</option>
              <option value="HR Interview">HR Interview</option>
              <option value="Offer Extended">Offer Extended</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {(selectedApplicant.status === 'Technical Interview' || selectedApplicant.status === 'HR Interview') && (
            <div style={{ marginBottom: '24px', background: '#1a1d21', padding: '16px', borderRadius: '8px', border: '1px solid #333' }}>
              <p style={{ color: '#white', fontWeight: 'bold', marginBottom: '12px' }}>Interview Scheduling</p>
              {selectedApplicant.interview_date ? (
                <div>
                  <p style={{ color: '#4ade80', fontSize: '0.9rem', marginBottom: '8px' }}>✓ Scheduled for {new Date(selectedApplicant.interview_date).toLocaleString()}</p>
                  <button 
                    onClick={() => {
                      const meetLink = prompt("Update Google Meet Link:");
                      const dateStr = prompt("Update Date/Time (YYYY-MM-DDTHH:MM):", new Date(selectedApplicant.interview_date).toISOString().slice(0, 16));
                      if (dateStr && meetLink) {
                        scheduleInterview(selectedApplicant.id, dateStr, meetLink);
                      }
                    }}
                    style={{ background: '#333', border: 'none', color: 'white', padding: '8px', borderRadius: '4px', width: '100%', cursor: 'pointer' }}
                  >
                    Reschedule
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    const meetLink = prompt("Google Meet Link:");
                    const dateStr = prompt("Date/Time (YYYY-MM-DDTHH:MM):");
                    if (dateStr && meetLink) {
                      scheduleInterview(selectedApplicant.id, dateStr, meetLink);
                    }
                  }}
                  style={{ background: '#6366f1', border: 'none', color: 'white', padding: '8px', borderRadius: '4px', width: '100%', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Schedule Now
                </button>
              )}
            </div>
          )}

          {selectedApplicant.resume_snapshot_url && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: '#888', marginBottom: '8px' }}>Resume</p>
              <a href={selectedApplicant.resume_snapshot_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px', background: '#1a1d21', border: '1px solid #333', color: '#6366f1', textAlign: 'center', borderRadius: '8px', textDecoration: 'none' }}>
                View Original Resume PDF
              </a>
            </div>
          )}
          
          {/* We will add feedback and notes in future iterations if needed */}
        </div>
      )}
    </div>
  );
};

export default ApplicantManagement;
