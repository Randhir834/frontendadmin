'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
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
  User,
  FileText,
  TrendingUp,
  Search,
  AlertCircle,
  X,
  Award,
  Briefcase,
  Trash2,
} from 'lucide-react';
import {
  getInstructorLeads,
  updateInstructorLead,
  deleteInstructorLead,
  getInstructorLeadsStats,
  exportInstructorLeadsToCSV,
  importInstructorLeads,
} from '@/services/leadsService';
import type { InstructorLead, LeadsStats } from '@/types';
import toast from 'react-hot-toast';

export default function InstructorLeadsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [leads, setLeads] = useState<InstructorLead[]>([]);
  const [stats, setStats] = useState<LeadsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'contacted' | 'accepted' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [authError, setAuthError] = useState(false);
  const [selectedLead, setSelectedLead] = useState<InstructorLead | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [leadToUpdate, setLeadToUpdate] = useState<{ lead: InstructorLead; status: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<InstructorLead | null>(null);

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
      const [leadsData, statsData] = await Promise.all([
        getInstructorLeads(),
        getInstructorLeadsStats(),
      ]);
      setLeads(leadsData.registrations || []);
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to fetch instructor leads:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to load instructor leads');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus =
      selectedStatus === 'all' || (lead.status || 'pending') === selectedStatus;
    const matchesSearch =
      !searchQuery ||
      lead.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.subject_expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone_number.includes(searchQuery);

    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (lead: InstructorLead, newStatus: string) => {
    setLeadToUpdate({ lead, status: newStatus });
    setStatusNotes('');
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!leadToUpdate) return;

    try {
      setActionLoading(leadToUpdate.lead.id);
      await updateInstructorLead(leadToUpdate.lead.id, {
        ...leadToUpdate.lead,
        status: leadToUpdate.status as any,
        notes: statusNotes,
      });
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

  const handleDeleteClick = (lead: InstructorLead) => {
    setLeadToDelete(lead);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;

    try {
      setActionLoading(leadToDelete.id);
      await deleteInstructorLead(leadToDelete.id);
      toast.success('Lead deleted successfully');
      setShowDeleteModal(false);
      setLeadToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast.error('Failed to delete lead');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (lead: InstructorLead) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
  };

  const handleExport = () => {
    exportInstructorLeadsToCSV(filteredLeads);
    toast.success('Instructor leads exported successfully');
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

      const leadsToImport: Partial<InstructorLead>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/"/g, ''));
        const lead: Partial<InstructorLead> = {
          full_name: values[0] || '',
          qualification: values[1] || '',
          subject_expertise: values[2] || '',
          phone_number: values[3] || '',
        };

        if (lead.full_name && lead.qualification && lead.subject_expertise && lead.phone_number) {
          leadsToImport.push(lead);
        }
      }

      if (leadsToImport.length === 0) {
        toast.error('No valid leads found in CSV');
        return;
      }

      const result = await importInstructorLeads(leadsToImport);
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
      accepted: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-purple-100 rounded-xl">
            <ClipboardList size={32} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Instructor Leads</h1>
            <p className="text-gray-600 mt-1">
              Manage instructor registration applications and inquiries
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
                <p className="text-sm text-gray-600 mb-1">Total Applications</p>
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
                <p className="text-sm text-gray-600 mb-1">Accepted</p>
                <p className="text-3xl font-bold text-green-600">{stats.accepted_count || 0}</p>
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
            placeholder="Search by name, qualification, expertise, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            { value: 'accepted', label: 'Accepted', icon: CheckCircle, color: 'green' },
            { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'red' },
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

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2 text-sm font-medium"
          >
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Download size={16} />
            Export CSV
          </Button>
          <Button
            variant="secondary"
            onClick={handleImportClick}
            disabled={importing}
            className="flex items-center gap-2 text-sm font-medium disabled:opacity-50"
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
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'No applications match your search criteria'
              : selectedStatus !== 'all'
              ? `No ${selectedStatus} applications at the moment`
              : 'No instructor applications have been submitted yet'}
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
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                      {lead.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{lead.full_name}</h3>
                        {getStatusBadge(lead.status)}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Phone size={14} />
                          {lead.phone_number}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <GraduationCap size={14} className="text-green-500" />
                      <span className="font-medium">Qualification:</span>
                      <span>{lead.qualification}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award size={14} className="text-blue-500" />
                      <span className="font-medium">Expertise:</span>
                      <span>{lead.subject_expertise}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase size={14} className="text-purple-500" />
                      <span className="font-medium">Role:</span>
                      <span>{lead.role || 'Instructor'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-orange-500" />
                      <span className="font-medium">Applied:</span>
                      <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {lead.notes && (
                    <div className="bg-purple-50 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2 text-sm text-purple-900">
                        <FileText size={14} className="text-purple-600 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-medium">Admin Notes: </span>
                          {lead.notes}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleViewDetails(lead)}
                      className="text-sm font-medium"
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
                          onClick={() => handleStatusChange(lead, 'accepted')}
                          disabled={actionLoading === lead.id}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleStatusChange(lead, 'rejected')}
                          disabled={actionLoading === lead.id}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {(lead.status || 'pending') === 'contacted' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusChange(lead, 'accepted')}
                          disabled={actionLoading === lead.id}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleStatusChange(lead, 'rejected')}
                          disabled={actionLoading === lead.id}
                        >
                          Reject
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(lead)}
                      disabled={actionLoading === lead.id}
                      className="text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                    {actionLoading === lead.id && (
                      <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
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
              <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
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
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-gray-900">{selectedLead.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone Number</label>
                  <p className="text-gray-900">{selectedLead.phone_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Qualification</label>
                  <p className="text-gray-900">{selectedLead.qualification}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Subject Expertise</label>
                  <p className="text-gray-900">{selectedLead.subject_expertise}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Role</label>
                  <p className="text-gray-900">{selectedLead.role || 'Instructor'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedLead.status)}</div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Application Date</label>
                  <p className="text-gray-900">
                    {new Date(selectedLead.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedLead.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Admin Notes</label>
                  <p className="text-gray-900 bg-purple-50 p-3 rounded-lg mt-1">
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
                <strong className="text-gray-900">{leadToUpdate.lead.full_name}</strong>?
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              </button>
              <Button
                variant="secondary"
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
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && leadToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Delete Application</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700">
                Are you sure you want to delete the application from{' '}
                <strong className="text-gray-900">{leadToDelete.full_name}</strong>? This action
                cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setLeadToDelete(null);
                }}
                className="flex-1 font-medium"
              >
                Cancel
              </button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={!!actionLoading}
                className="flex-1 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
