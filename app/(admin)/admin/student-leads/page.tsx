'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Loader2,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  MessageSquare,
  User,
  FileText,
  TrendingUp,
  Search,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  getStudentLeads,
  getTrialRequests,
  updateStudentLeadStatus,
  getStudentLeadsStats,
  exportStudentLeadsToCSV,
  importStudentLeads,
} from '@/services/leadsService';
import type { StudentLead, LeadsStats } from '@/types';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function StudentLeadsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [leads, setLeads] = useState<StudentLead[]>([]);
  const [trialRequests, setTrialRequests] = useState<StudentLead[]>([]);
  const [allLeads, setAllLeads] = useState<StudentLead[]>([]);
  const [stats, setStats] = useState<LeadsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'contacted' | 'completed' | 'cancelled'>('pending');
  const [selectedType, setSelectedType] = useState<'all' | 'general' | 'trial'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [authError, setAuthError] = useState(false);
  const [selectedLead, setSelectedLead] = useState<StudentLead | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [leadToUpdate, setLeadToUpdate] = useState<{ lead: StudentLead; status: string } | null>(null);
  const [importing, setImporting] = useState(false);

  // Check authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (!token) {
        setAuthError(true);
        toast.error('Please login to access this page');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      try {
        const userData = user ? JSON.parse(user) : null;
        if (userData?.role !== 'admin') {
          setAuthError(true);
          toast.error('Access denied. Admin privileges required.');
          setTimeout(() => router.push('/admin'), 2000);
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [router]);

  useEffect(() => {
    if (!authError) {
      fetchData();
    }
  }, [authError]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both leads and stats simultaneously to prevent staggered loading
      const [contactData, trialData, statsData] = await Promise.all([
        getStudentLeads({ limit: 1000 }),
        getTrialRequests(),
        getStudentLeadsStats(),
      ]);
      setLeads(contactData.leads || []);
      setTrialRequests(trialData.trialRequests || []);
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to fetch student leads:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load student leads');
      }
    } finally {
      setLoading(false);
    }
  };

  // Combine and filter leads
  useEffect(() => {
    const combined = [...leads, ...trialRequests];
    setAllLeads(combined);
  }, [leads, trialRequests]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const [contactData, trialData] = await Promise.all([
        getStudentLeads({ limit: 1000 }),
        getTrialRequests(),
      ]);
      setLeads(contactData.leads || []);
      setTrialRequests(trialData.trialRequests || []);
    } catch (error: any) {
      console.error('Failed to fetch student leads:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load student leads');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getStudentLeadsStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const filteredLeads = allLeads.filter((lead) => {
    const matchesStatus =
      selectedStatus === 'all' || (lead.status || 'pending') === selectedStatus;
    const matchesType =
      selectedType === 'all' || (lead.type || 'trial') === selectedType;
    const matchesSearch =
      !searchQuery ||
      (lead.parent_name || lead.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.phone || '').includes(searchQuery) ||
      (lead.child_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const handleStatusChange = (lead: StudentLead, newStatus: string) => {
    setLeadToUpdate({ lead, status: newStatus });
    setStatusNotes('');
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!leadToUpdate) return;

    try {
      setActionLoading(leadToUpdate.lead.id);
      await updateStudentLeadStatus(
        leadToUpdate.lead.id,
        leadToUpdate.status as any,
        statusNotes
      );
      toast.success(`Lead status updated to ${leadToUpdate.status}`);
      setShowStatusModal(false);
      setLeadToUpdate(null);
      setStatusNotes('');
      fetchData();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (lead: StudentLead) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
  };

  const handleExport = () => {
    exportStudentLeadsToCSV(filteredLeads);
    toast.success('Student leads exported successfully');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      setImporting(true);
      const text = await file.text();
      const lines = text.split('\n').filter((line) => line.trim());
      const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));

      const leadsToImport: Partial<StudentLead>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
        const lead: Partial<StudentLead> = {
          parent_name: values[0] || '',
          child_name: values[1] || '',
          email: values[2] || '',
          phone: values[3] || '',
          grade: values[4] || '',
          course_interest: values[5] || '',
          type: (values[6] || 'general') as any,
          message: values[8] || '',
        };

        if (lead.email && lead.phone && lead.parent_name) {
          leadsToImport.push(lead);
        }
      }

      if (leadsToImport.length === 0) {
        toast.error('No valid leads found in CSV');
        return;
      }

      const result = await importStudentLeads(leadsToImport);
      toast.success(result.message);
      fetchData();
    } catch (error) {
      console.error('Failed to import leads:', error);
      toast.error('Failed to import leads');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getStatusBadge = (status?: string) => {
    const actualStatus = status || 'pending';
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      contacted: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          styles[actualStatus as keyof typeof styles] || styles.pending
        }`}
      >
        {actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type?: string) => {
    const actualType = type || 'trial';
    const styles = {
      general: 'bg-purple-100 text-purple-800 border-purple-300',
      trial: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          styles[actualType as keyof typeof styles] || styles.trial
        }`}
      >
        {actualType === 'general' ? 'Contact' : 'Trial Request'}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-xl">
            <UserPlus size={32} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Student Leads</h1>
            <p className="text-gray-600 mt-1">
              Manage student contact requests and trial applications
            </p>
          </div>
        </div>
      </div>

      {/* Authentication Error */}
      {authError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Authentication Required</h3>
              <p className="text-red-700 text-sm">
                Please login as an admin to access this page. Redirecting...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_count}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending_count}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Contacted</p>
                <p className="text-3xl font-bold text-blue-600">{stats.contacted_count}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed_count}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Status:</span>
          </div>
          {[
            { value: 'pending', label: 'Pending', icon: Clock, color: 'yellow' },
            { value: 'contacted', label: 'Contacted', icon: Phone, color: 'blue' },
            { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'green' },
            { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'red' },
            { value: 'all', label: 'All', icon: TrendingUp, color: 'gray' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value as any)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedStatus === tab.value
                  ? `bg-${tab.color}-100 text-${tab.color}-800 border-2 border-${tab.color}-300`
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Type:</span>
          {[
            { value: 'trial', label: 'Trial Requests', color: 'indigo' },
            { value: 'general', label: 'Contact Forms', color: 'purple' },
            { value: 'all', label: 'All Types', color: 'gray' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedType(tab.value as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedType === tab.value
                  ? `bg-${tab.color}-100 text-${tab.color}-800 border-2 border-${tab.color}-300`
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Download size={16} />
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleImportClick}
            disabled={importing}
            className="flex items-center gap-2 disabled:opacity-50"
          >
            {importing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leads Found</h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'No leads match your search criteria'
              : selectedStatus !== 'all'
              ? `No ${selectedStatus} leads at the moment`
              : 'No student leads have been submitted yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                      {(lead.parent_name || lead.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {lead.parent_name || lead.name}
                        </h3>
                        {getStatusBadge(lead.status)}
                        {getTypeBadge(lead.type)}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail size={14} />
                          {lead.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={14} />
                          {lead.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {lead.child_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={14} className="text-purple-500" />
                        <span className="font-medium">Child:</span>
                        <span>{lead.child_name}</span>
                      </div>
                    )}
                    {lead.grade && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <GraduationCap size={14} className="text-green-500" />
                        <span className="font-medium">Grade:</span>
                        <span>{lead.grade}</span>
                      </div>
                    )}
                    {lead.course_interest && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText size={14} className="text-blue-500" />
                        <span className="font-medium">Interest:</span>
                        <span>{lead.course_interest}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-orange-500" />
                      <span className="font-medium">Date:</span>
                      <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Message */}
                  {lead.message && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <MessageSquare size={14} className="text-gray-400 mt-0.5" />
                        <p className="flex-1">{lead.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {lead.notes && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2 text-sm text-blue-900">
                        <FileText size={14} className="text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-medium">Admin Notes: </span>
                          {lead.notes}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewDetails(lead)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    {(lead.status || 'pending') === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStatusChange(lead, 'contacted')}
                          disabled={actionLoading === lead.id}
                        >
                          Mark Contacted
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusChange(lead, 'completed')}
                          disabled={actionLoading === lead.id}
                        >
                          Complete
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleStatusChange(lead, 'cancelled')}
                          disabled={actionLoading === lead.id}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {(lead.status || 'pending') === 'contacted' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusChange(lead, 'completed')}
                          disabled={actionLoading === lead.id}
                        >
                          Complete
                        </Button>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleStatusChange(lead, 'pending')}
                          disabled={actionLoading === lead.id}
                        >
                          Back to Pending
                        </Button>
                      </>
                    )}
                    {actionLoading === lead.id && (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Lead Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Parent/Name</label>
                  <p className="text-gray-900">{selectedLead.parent_name || selectedLead.name}</p>
                </div>
                {selectedLead.child_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Child Name</label>
                    <p className="text-gray-900">{selectedLead.child_name}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{selectedLead.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{selectedLead.phone}</p>
                </div>
                {selectedLead.grade && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Grade</label>
                    <p className="text-gray-900">{selectedLead.grade}</p>
                  </div>
                )}
                {selectedLead.course_interest && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Course Interest</label>
                    <p className="text-gray-900">{selectedLead.course_interest}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <div className="mt-1">{getTypeBadge(selectedLead.type)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedLead.status)}</div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-gray-900">
                    {new Date(selectedLead.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedLead.message && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Message</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
                    {selectedLead.message}
                  </p>
                </div>
              )}
              {selectedLead.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Admin Notes</label>
                  <p className="text-gray-900 bg-blue-50 p-3 rounded-lg mt-1">
                    {selectedLead.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && leadToUpdate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Update Status</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Change status to{' '}
                <strong className="text-gray-900">{leadToUpdate.status}</strong> for{' '}
                <strong className="text-gray-900">
                  {leadToUpdate.lead.parent_name || leadToUpdate.lead.name}
                </strong>
                ?
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter any notes about this status change..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStatusModal(false);
                  setLeadToUpdate(null);
                  setStatusNotes('');
                }}
                className="flex-1 font-medium"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStatusUpdate}
                disabled={!!actionLoading}
                className="flex-1 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Confirm'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
