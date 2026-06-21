'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Eye, Shield, AlertCircle, Download } from 'lucide-react';
import Button from '../ui/Button';
import { courseMaterialService } from '@/services/courseMaterialService';

interface AccessLog {
  id: number;
  user_name: string;
  user_email: string;
  access_type: string;
  ip_address: string;
  user_agent: string;
  access_granted: boolean;
  blocked_reason: string | null;
  accessed_at: string;
}

interface MaterialAccessLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: {
    id: number;
    title: string;
  };
}

export default function MaterialAccessLogsModal({
  isOpen,
  onClose,
  material,
}: MaterialAccessLogsModalProps) {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, material.id]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await courseMaterialService.getMaterialAccessLogs(material.id);
      setLogs(response.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => 
        filter === 'blocked' ? !log.access_granted : log.access_type === filter
      );

  const getAccessTypeIcon = (type: string, granted: boolean) => {
    if (!granted) return <Shield className="size-4 text-[#EF4444]" />;
    if (type.includes('view')) return <Eye className="size-4 text-[#10B981]" />;
    if (type.includes('download')) return <Download className="size-4 text-[#F59E0B]" />;
    return <AlertCircle className="size-4 text-[#64748B]" />;
  };

  const getAccessTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      view: { label: 'View', color: 'bg-[#DBEAFE] text-[#1E88E5]' },
      view_request: { label: 'Token Request', color: 'bg-[#E0E7FF] text-[#6366F1]' },
      download_attempt: { label: 'Download Attempt', color: 'bg-[#FEF3C7] text-[#D97706]' },
      screenshot_attempt: { label: 'Screenshot', color: 'bg-[#FFEDD5] text-[#EA580C]' },
      upload: { label: 'Upload', color: 'bg-[#D1FAE5] text-[#059669]' },
    };
    
    const typeInfo = types[type] || { label: type, color: 'bg-[#F1F5F9] text-[#64748B]' };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  const downloadCSV = () => {
    const headers = ['Date/Time', 'User', 'Email', 'Action', 'Status', 'IP Address', 'Reason'];
    const rows = filteredLogs.map(log => [
      new Date(log.accessed_at).toLocaleString(),
      log.user_name,
      log.user_email,
      log.access_type,
      log.access_granted ? 'Granted' : 'Blocked',
      log.ip_address,
      log.blocked_reason || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `material-${material.id}-access-logs.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-xl font-semibold text-[#1E293B]">Access Logs</h2>
            <p className="text-sm text-[#64748B] mt-1">{material.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#1E293B]"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[#64748B]">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1.5 border border-[#CBD5E1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
            >
              <option value="all">All Activity</option>
              <option value="view">Views Only</option>
              <option value="download_attempt">Download Attempts</option>
              <option value="screenshot_attempt">Screenshot Attempts</option>
              <option value="blocked">Blocked Only</option>
            </select>
            <span className="text-sm text-[#64748B]">
              ({filteredLogs.length} {filteredLogs.length === 1 ? 'record' : 'records'})
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCSV}
            disabled={filteredLogs.length === 0}
          >
            <Download className="size-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-[#1E88E5]" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="size-16 text-[#CBD5E1] mx-auto mb-4" />
              <p className="text-[#64748B]">No access logs found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border ${
                    log.access_granted
                      ? 'border-[#E2E8F0] bg-white'
                      : 'border-[#FEE2E2] bg-[#FEF2F2]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getAccessTypeIcon(log.access_type, log.access_granted)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-[#1E293B]">{log.user_name}</span>
                          {getAccessTypeBadge(log.access_type)}
                          {!log.access_granted && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#FEE2E2] text-[#991B1B]">
                              Blocked
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#64748B]">{log.user_email}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#94A3B8]">
                          <span>{new Date(log.accessed_at).toLocaleString()}</span>
                          <span>•</span>
                          <span>IP: {log.ip_address}</span>
                        </div>
                        {log.blocked_reason && (
                          <div className="mt-2 px-3 py-2 bg-[#FEE2E2] rounded text-xs text-[#991B1B]">
                            {log.blocked_reason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
