'use client';

import { useEffect, useState, Suspense } from 'react';
import { Calendar, Clock, Users, Loader2, Plus, Edit2, Trash2, ExternalLink, AlertCircle, Search } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { liveClassService } from '@/services/liveClassService';
import type { LiveClass } from '@/types';

function AdminLiveClassManagementContent() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      const data = await liveClassService.getLiveClasses();
      setClasses(data.liveClasses || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch live classes:', err);
      setError('Failed to load live classes');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveClasses();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this live class?')) return;

    try {
      await liveClassService.deleteLiveClass(id);
      setClasses(classes.filter(c => c.id !== id));
    } catch (err) {
      setError('Failed to delete live class');
    }
  };

  const filteredClasses = classes.filter(c => {
    const scheduledDate = new Date(c.scheduled_at);
    const now = new Date();
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'upcoming' && scheduledDate > now) ||
      (filter === 'completed' && scheduledDate <= now);
    
    const matchesSearch = 
      searchTerm === '' ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: classes.length,
    upcoming: classes.filter(c => new Date(c.scheduled_at) > new Date()).length,
    completed: classes.filter(c => new Date(c.scheduled_at) <= new Date()).length,
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1E293B]">Live Class Management</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Monitor and manage all live classes across the platform
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1E293B]">{stats.total}</div>
              <div className="text-sm text-[#64748B]">Total Classes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1B8A44]">{stats.upcoming}</div>
              <div className="text-sm text-[#64748B]">Upcoming</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#7C3AED]">{stats.completed}</div>
              <div className="text-sm text-[#64748B]">Completed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Search and Filter */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search by class title, course, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 text-sm"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E2E8F0]">
          {[
            { key: 'upcoming' as const, label: 'Upcoming', count: stats.upcoming },
            { key: 'completed' as const, label: 'Completed', count: stats.completed },
            { key: 'all' as const, label: 'All Classes', count: stats.total },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                filter === tab.key
                  ? 'border-[#1B8A44] text-[#1B8A44]'
                  : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Live Classes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-[#1B8A44]" />
        </div>
      ) : filteredClasses.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <Calendar className="size-12 text-[#CBD5E1] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#1E293B] mb-2">
                {classes.length === 0 ? 'No live classes scheduled' : 'No classes found'}
              </h3>
              <p className="text-sm text-[#64748B]">
                {classes.length === 0
                  ? 'No live classes have been scheduled yet.'
                  : 'Try adjusting your search or filter.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredClasses.map((liveClass) => {
            const isUpcoming = new Date(liveClass.scheduled_at) > new Date();
            return (
              <Card key={liveClass.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Class Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          isUpcoming ? 'bg-[#1B8A44]/10' : 'bg-[#64748B]/10'
                        }`}>
                          <Calendar className={`size-5 ${
                            isUpcoming ? 'text-[#1B8A44]' : 'text-[#64748B]'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-[#1E293B] truncate">
                            {liveClass.title}
                          </h3>
                          <p className="text-sm text-[#64748B] mt-1">
                            Course: {liveClass.course_title}
                          </p>
                          {liveClass.instructor_name && (
                            <p className="text-sm text-[#64748B] mt-1">
                              Instructor: {liveClass.instructor_name}
                            </p>
                          )}
                          {liveClass.description && (
                            <p className="text-sm text-[#64748B] mt-2 line-clamp-2">
                              {liveClass.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Date, Time, Duration */}
                      <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2 text-[#64748B]">
                          <Calendar className="size-4" />
                          {formatDateTime(liveClass.scheduled_at)}
                        </div>
                        <div className="flex items-center gap-2 text-[#64748B]">
                          <Clock className="size-4" />
                          {liveClass.duration_minutes} min
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                      <a
                        href={liveClass.meet_link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1B8A44] text-white rounded-lg hover:bg-[#157a35] transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="size-4" />
                        <span className="hidden sm:inline">Open Meet</span>
                        <span className="sm:hidden">Meet</span>
                      </a>
                      <button
                        onClick={() => {
                          // TODO: Implement edit functionality
                          alert('Edit functionality coming soon');
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-[#E2E8F0] text-[#1E293B] rounded-lg hover:bg-[#F8FAFC] transition-colors text-sm font-medium"
                      >
                        <Edit2 className="size-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(liveClass.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                      >
                        <Trash2 className="size-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminLiveClassManagementPage() {
  return (
    <Suspense fallback={
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-[#1B8A44]" />
        </div>
      </div>
    }>
      <AdminLiveClassManagementContent />
    </Suspense>
  );
}
