import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { 
  Search, Filter, ArrowUpDown, Download,
  Users, UserCheck, Calendar, Award,
  X, Briefcase, FileText, ChevronRight,
  Inbox, CheckCircle, Trash2
} from 'lucide-react';

type ApplicationType = Record<string, unknown>;

const STATUS_CONFIG: Record<string, { color: string, bg: string, border: string }> = {
  'Applied': { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-500' },
  'Screening': { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-500' },
  'Shortlisted': { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-500' },
  'Technical Interview': { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-500' },
  'HR Interview': { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-500' },
  'Offer Extended': { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-500' },
  'Hired': { color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-500' },
  'Rejected': { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-500' },
};

const STATUSES = Object.keys(STATUS_CONFIG);

const ApplicantManagement = () => {
  const { activeOrganization } = useAuthStore();
  const { jobId } = useParams<{ jobId: string }>();
  const [applicants, setApplicants] = useState<ApplicationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicationType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scorecards, setScorecards] = useState<any[]>([]);
  const [newScorecard, setNewScorecard] = useState({ interviewer_name: '', communication_score: 8, technical_score: 8, culture_score: 8, comments: '' });
  const [isGeneratingOffer, setIsGeneratingOffer] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterMinScore, setFilterMinScore] = useState<number>(0);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    if (selectedApplicant) {
      apiClient.get(`/api/applications/${selectedApplicant.id}/scorecards`)
        .then(res => setScorecards(res.data))
        .catch(err => console.error("Error fetching scorecards", err));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScorecards([]);
    }
  }, [selectedApplicant]);

  const submitScorecard = async () => {
    if (!selectedApplicant || !newScorecard.interviewer_name) return toast.error("Interviewer name is required");
    try {
      const res = await apiClient.post(`/api/applications/${selectedApplicant.id}/scorecards`, newScorecard);
      setScorecards([...scorecards, res.data]);
      setNewScorecard({ interviewer_name: '', communication_score: 8, technical_score: 8, culture_score: 8, comments: '' });
      toast.success("Scorecard saved!");
    } catch (e) {
      toast.error("Failed to save scorecard");
    }
  };

  const generateOfferLetter = async () => {
    if (!selectedApplicant) return;
    setIsGeneratingOffer(true);
    try {
      const res = await apiClient.post(`/api/applications/${selectedApplicant.id}/generate-offer`);
      setSelectedApplicant(res.data);
      toast.success("Offer Letter Generated!");
      fetchApplicants();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to generate offer letter");
    } finally {
      setIsGeneratingOffer(false);
    }
  };

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
      toast.success("Candidate moved to " + newStatus);
      if (selectedApplicant && selectedApplicant.id === appId) {
        setSelectedApplicant({ ...selectedApplicant, status: newStatus });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
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

  const deleteApplicant = async (appId: number) => {
    if (!window.confirm("Are you sure you want to delete this applicant? This action cannot be undone.")) return;
    try {
      await apiClient.delete(`/api/applications/${appId}`);
      setApplicants(prev => prev.filter(a => a.id !== appId));
      if (selectedApplicant?.id === appId) setSelectedApplicant(null);
      toast.success("Applicant deleted successfully");
    } catch (error) {
      toast.error("Failed to delete applicant");
    }
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

  // Metrics calculation
  const metrics = useMemo(() => {
    return {
      total: applicants.length,
      active: applicants.filter(a => !['Hired', 'Rejected'].includes(a.status)).length,
      screening: applicants.filter(a => a.status === 'Screening').length,
      interviews: applicants.filter(a => ['Technical Interview', 'HR Interview'].includes(a.status)).length,
      offers: applicants.filter(a => a.status === 'Offer Extended').length,
      hired: applicants.filter(a => a.status === 'Hired').length,
    };
  }, [applicants]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter(a => {
      const matchesSearch = !searchQuery || 
        a.candidate?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = !filterStatus || a.status === filterStatus;
      const matchesScore = (a.candidate_score || 0) >= filterMinScore;
      
      return matchesSearch && matchesStatus && matchesScore;
    });
  }, [applicants, searchQuery, filterStatus, filterMinScore]);

  const exportToCSV = () => {
    if (filteredApplicants.length === 0) {
      toast.error("No candidates to export");
      return;
    }
    const headers = ["Candidate Name", "Email", "Job Title", "Status", "Match Score", "Applied At"];
    const rows = filteredApplicants.map(app => [
      `"${app.candidate?.user?.name || 'N/A'}"`,
      `"${app.candidate?.user?.email || 'N/A'}"`,
      `"${app.job?.title || 'N/A'}"`,
      `"${app.status || 'N/A'}"`,
      `${app.candidate_score || 0}`,
      `"${new Date(app.applied_at).toLocaleDateString()}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `candidates_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export successful!");
  };

  const getMatchScoreBadge = (score: number) => {
    if (score >= 90) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">🟢 {score}% Match</span>;
    if (score >= 70) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">🟡 {score}% Match</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">🔴 {score}% Match</span>;
  };

  const jobTitle = applicants.length > 0 && jobId ? applicants[0].job?.title : "All Jobs";

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex flex-col font-sans transition-colors duration-200">
      {/* Header Section */}
      <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 px-8 py-6">
        <div className="max-w-[1600px] mx-auto">
          {jobId && (
            <Link to="/dashboard/jobs" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium mb-4 inline-flex items-center">
              &larr; Back to Jobs
            </Link>
          )}
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Application Management</h1>
              <div className="flex items-center mt-2 text-slate-600 dark:text-slate-400 text-sm font-medium">
                <Briefcase className="w-4 h-4 mr-2" />
                <span className="text-slate-900 dark:text-white mr-4">{jobTitle}</span>
                <span className="flex items-center"><Users className="w-4 h-4 mr-1"/> {metrics.total} Applicants</span>
                <span className="mx-2">•</span>
                <span className="flex items-center text-blue-600 dark:text-blue-400"><UserCheck className="w-4 h-4 mr-1"/> {metrics.active} Active</span>
                <span className="mx-2">•</span>
                <span className="flex items-center text-yellow-600 dark:text-yellow-400"><Calendar className="w-4 h-4 mr-1"/> {metrics.interviews} Interviews</span>
                <span className="mx-2">•</span>
                <span className="flex items-center text-emerald-600 dark:text-emerald-400"><Award className="w-4 h-4 mr-1"/> {metrics.offers} Offers</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search candidates..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
                />
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors ${showFilterMenu ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <Filter className="w-4 h-4" />
                </button>
                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-4">
                    <h4 className="text-sm font-semibold mb-3 dark:text-white">Filter Candidates</h4>
                    <div className="mb-3">
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full text-sm rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white p-2 outline-none">
                        <option value="">All Statuses</option>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Min Match Score: {filterMinScore}%</label>
                      <input type="range" min="0" max="100" step="10" value={filterMinScore} onChange={e => setFilterMinScore(parseInt(e.target.value))} className="w-full" />
                    </div>
                    <div className="flex justify-between mt-4 items-center">
                      <button onClick={() => { setFilterStatus(''); setFilterMinScore(0); setShowFilterMenu(false); }} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline">Clear Filters</button>
                      <button onClick={() => setShowFilterMenu(false)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">Apply Filters</button>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="px-8 pt-6">
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Applications', value: metrics.total, color: 'blue' },
            { label: 'Screening', value: metrics.screening, color: 'purple' },
            { label: 'Interviews', value: metrics.interviews, color: 'yellow' },
            { label: 'Offers', value: metrics.offers, color: 'emerald' },
            { label: 'Hired', value: metrics.hired, color: 'teal' },
          ].map((metric, i) => (
            <div key={i} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{metric.label}</span>
              <span className={`text-2xl font-bold mt-2 text-${metric.color}-600 dark:text-${metric.color}-400`}>{metric.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="flex-1 overflow-x-auto px-8 py-6 pb-12 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 h-full items-start">
              {STATUSES.map(status => {
                const config = STATUS_CONFIG[status];
                const columnApplicants = filteredApplicants.filter(a => a.status === status);
                
                return (
                  <div 
                    key={status} 
                    className="flex flex-col bg-slate-100/50 dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden w-80 shrink-0 max-h-[calc(100vh-280px)]"
                  >
                    {/* Header */}
                    <div className={`border-t-4 ${config.border} bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-10`}>
                      <h3 className={`font-semibold text-sm ${config.color}`}>{status}</h3>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded-full">
                        {columnApplicants.length}
                      </span>
                    </div>

                    {/* Droppable Area */}
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-3 overflow-y-auto custom-scrollbar min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200/50 dark:bg-slate-800/50' : ''}`}
                        >
                          {columnApplicants.length === 0 && !snapshot.isDraggingOver && (
                            <div className="h-32 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg mx-2 my-2 opacity-50">
                              <Inbox className="w-8 h-8 mb-2" />
                              <span className="text-sm font-medium">No candidates</span>
                            </div>
                          )}

                          {columnApplicants.map((app, index) => (
                            <Draggable key={`app-${app.id}`} draggableId={`app-${app.id}`} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedApplicant(app)}
                                  className={`group relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-3 cursor-grab hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-md transition-all duration-200 ${snapshot.isDragging ? 'shadow-xl rotate-2 z-50 ring-2 ring-blue-500' : ''}`}
                                  style={{
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  {/* Quick Actions Hover */}
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex bg-white dark:bg-[#111827] shadow-sm rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden z-10">
                                    <button 
                                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 border-r border-slate-200 dark:border-slate-700"
                                      title="View Profile"
                                      onClick={(e) => { e.stopPropagation(); setSelectedApplicant(app); }}
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>
                                    <button 
                                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                      title="Delete Applicant"
                                      onClick={(e) => { e.stopPropagation(); deleteApplicant(app.id); }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner">
                                      {getInitials(app.candidate?.user?.name)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate pr-6">
                                        {app.candidate?.user?.name || `Candidate #${app.candidate?.id || 'Unknown'}`}
                                      </h4>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                        {app.candidate?.user?.email || app.job?.title}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mb-3">
                                    {getMatchScoreBadge(app.candidate_score || 0)}
                                  </div>

                                  {app.candidate?.skills && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                      {Array.isArray(app.candidate.skills) 
                                        ? app.candidate.skills.slice(0, 3).map((s: string, i: number) => (
                                          <span key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-medium truncate max-w-[80px]">
                                            {s}
                                          </span>
                                        ))
                                        : typeof app.candidate.skills === 'string' 
                                          ? app.candidate.skills.split(',').slice(0, 3).map((s: string, i: number) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-medium truncate max-w-[80px]">
                                              {s.trim()}
                                            </span>
                                          ))
                                          : null
                                      }
                                      {Array.isArray(app.candidate.skills) && app.candidate.skills.length > 3 && (
                                        <span className="px-1.5 py-0.5 text-slate-400 text-[10px] font-medium">+{app.candidate.skills.length - 3}</span>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(app.applied_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                                    <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors">Details <ChevronRight className="w-3 h-3"/></span>
                                  </div>
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
        )}
      </div>

      {/* Candidate Details Drawer Overlay */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedApplicant(null)}
          ></div>
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white dark:bg-[#0b0f19] h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in-right">
            
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-[#111827]/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-white dark:border-slate-800">
                  {getInitials(selectedApplicant.candidate?.user?.name)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedApplicant.candidate?.user?.name || 'Applicant'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{selectedApplicant.candidate?.user?.email}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{selectedApplicant.job?.title}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedApplicant(null)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Score & Status Section */}
              <div className="flex gap-4">
                <div className="flex-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Match Score</p>
                  <div className="text-3xl font-extrabold tracking-tight" style={{ color: selectedApplicant.candidate_score >= 80 ? '#10B981' : selectedApplicant.candidate_score >= 60 ? '#F59E0B' : '#EF4444' }}>
                    {selectedApplicant.candidate_score || 0}%
                  </div>
                </div>
                <div className="flex-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Stage</p>
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
                    className={`w-full font-semibold text-sm outline-none bg-transparent ${STATUS_CONFIG[selectedApplicant.status]?.color || 'text-slate-900 dark:text-white'}`}
                  >
                    {STATUSES.map(status => <option key={status} value={status} className="text-slate-900 dark:text-white bg-white dark:bg-slate-800">{status}</option>)}
                  </select>
                </div>
              </div>

              {/* Interview Scheduling */}
              {(selectedApplicant.status === 'Technical Interview' || selectedApplicant.status === 'HR Interview') && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Interview Details</h3>
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
                    {selectedApplicant.interview_date ? (
                      <div>
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-sm mb-3">
                          <Calendar className="w-4 h-4" />
                          Scheduled for {new Date(selectedApplicant.interview_date).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </div>
                        <button 
                          onClick={() => {
                            const meetLink = prompt("Update Google Meet Link:");
                            if(!meetLink) return;
                            const dateStr = prompt("Update Date/Time (YYYY-MM-DDTHH:MM):", new Date(selectedApplicant.interview_date).toISOString().slice(0, 16));
                            if (dateStr) scheduleInterview(selectedApplicant.id, dateStr, meetLink);
                          }}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                        >
                          Reschedule Interview
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">No interview scheduled yet.</p>
                        <button 
                          onClick={() => {
                            const meetLink = prompt("Google Meet Link:");
                            if(!meetLink) return;
                            const dateStr = prompt("Date/Time (YYYY-MM-DDTHH:MM):");
                            if (dateStr) scheduleInterview(selectedApplicant.id, dateStr, meetLink);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-sm"
                        >
                          Schedule Interview
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Generate Offer Letter */}
              {selectedApplicant.status === 'Offer Extended' && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Offer Letter</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4">
                    {selectedApplicant.offer_letter_url ? (
                      <div>
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-sm mb-3">
                          <CheckCircle className="w-4 h-4" />
                          Offer letter generated and sent to candidate.
                        </div>
                        <a 
                          href={selectedApplicant.offer_letter_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex justify-center w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                        >
                          View PDF Offer Letter
                        </a>
                      </div>
                    ) : (
                      <button 
                        onClick={generateOfferLetter}
                        disabled={isGeneratingOffer}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
                      >
                        {isGeneratingOffer ? "Generating PDF..." : "Generate Offer Letter"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Scorecards */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Interview Scorecards</h3>
                <div className="space-y-4">
                  {/* List Scorecards */}
                  {scorecards.length > 0 && (
                    <div className="space-y-3">
                      {scorecards.map((sc, i) => (
                        <div key={i} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-sm text-slate-900 dark:text-white">{sc.interviewer_name}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(sc.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                            <span>Comm: <span className="text-slate-900 dark:text-white">{sc.communication_score}/10</span></span>
                            <span>Tech: <span className="text-slate-900 dark:text-white">{sc.technical_score}/10</span></span>
                            <span>Culture: <span className="text-slate-900 dark:text-white">{sc.culture_score}/10</span></span>
                          </div>
                          {sc.comments && <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{sc.comments}"</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Scorecard Form */}
                  <div className="bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Add Feedback</h4>
                    <input 
                      type="text" placeholder="Interviewer Name" 
                      value={newScorecard.interviewer_name} onChange={e => setNewScorecard({...newScorecard, interviewer_name: e.target.value})}
                      className="w-full mb-3 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    />
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div>
                        <label className="text-[10px] uppercase text-slate-500 font-bold">Communication</label>
                        <select value={newScorecard.communication_score} onChange={e => setNewScorecard({...newScorecard, communication_score: parseInt(e.target.value)})} className="w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-1.5">
                          {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-slate-500 font-bold">Technical</label>
                        <select value={newScorecard.technical_score} onChange={e => setNewScorecard({...newScorecard, technical_score: parseInt(e.target.value)})} className="w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-1.5">
                          {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-slate-500 font-bold">Culture Fit</label>
                        <select value={newScorecard.culture_score} onChange={e => setNewScorecard({...newScorecard, culture_score: parseInt(e.target.value)})} className="w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-1.5">
                          {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                        </select>
                      </div>
                    </div>
                    <textarea 
                      placeholder="Notes / Comments" 
                      value={newScorecard.comments} onChange={e => setNewScorecard({...newScorecard, comments: e.target.value})}
                      className="w-full mb-3 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm min-h-[60px]"
                    ></textarea>
                    <button onClick={submitScorecard} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">
                      Save Scorecard
                    </button>
                  </div>
                </div>
              </div>

              {/* Candidate Info */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Candidate Profile</h3>
                <div className="space-y-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                  
                  {selectedApplicant.candidate?.experience_years !== undefined && (
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-semibold">Experience</span>
                      <p className="text-sm text-slate-900 dark:text-white mt-1 font-medium">{selectedApplicant.candidate.experience_years} Years</p>
                    </div>
                  )}

                  {selectedApplicant.candidate?.skills && (
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-semibold">Skills</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Array.isArray(selectedApplicant.candidate.skills) 
                          ? selectedApplicant.candidate.skills.map((s: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium border border-slate-200 dark:border-slate-700">{s}</span>
                          ))
                          : typeof selectedApplicant.candidate.skills === 'string'
                            ? selectedApplicant.candidate.skills.split(',').map((s: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium border border-slate-200 dark:border-slate-700">{s.trim()}</span>
                            ))
                            : null
                        }
                      </div>
                    </div>
                  )}

                  {selectedApplicant.resume_snapshot_url && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <a 
                        href={selectedApplicant.resume_snapshot_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-center w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 font-medium py-2.5 rounded-lg text-sm transition-colors border border-slate-200 dark:border-slate-700"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Original Resume
                      </a>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantManagement;
