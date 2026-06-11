'use client';

import { useEffect, useState, Suspense } from 'react';
import { Calendar, Clock, Loader2, Trash2, ExternalLink, AlertCircle, Search, Video, BookOpen, User, Filter, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { liveClassService } from '@/services/liveClassService';
import { adminService } from '@/services/adminService';
import { courseService } from '@/services/courseService';
import type { LiveClass, User as UserType, Course } from '@/types';

function AdminLiveClassManagementContent() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [instructors, setInstructors] = useState<UserType[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live' | 'completed'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Advanced filters
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (selectedInstructor) filters.instructor_id = selectedInstructor;
      if (selectedCourse) filters.course_id = selectedCourse;
      if (dateFrom) filters.date_from = dateFrom;
      if (dateTo) filters.date_to = dateTo;
      if (searchTerm) filters.search = searchTerm;
      
      const data = await liveClassService.getLiveClasses(filters);
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

  const fetchInstructors = async () => {
    try {
      const data = await adminService.getUsers('instructor');
      setInstructors(data.users || []);
    } catch (err) {
      console.error('Failed to fetch instructors:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await courseService.getCourses();
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  useEffect(() => {
    fetchInstructors();
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchLiveClasses();
  }, [selectedInstructor, selectedCourse, dateFrom, dateTo]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this live class?')) return;

    try {
      await liveClassService.deleteLiveClass(id);
      setClasses(classes.filter(c => c.id !== id));
    } catch (err) {
      setError('Failed to delete live class');
    }
  };

  const handleSearch = () => {
    fetchLiveClasses();
  };

  const clearFilters = () => {
    setSelectedInstructor('');
    setSelectedCourse('');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedInstructor || selectedCourse || dateFrom || dateTo;

  const getClassStatus = (scheduledAt: string, durationMinutes: number) => {
    const now = new Date();
    const scheduledDate = new Date(scheduledAt);
    const endDate = new Date(scheduledDate.getTime() + durationMinutes * 60000);

    if (now < scheduledDate) return 'upcoming';
    if (now >= scheduledDate && now <= endDate) return 'live';
    return 'completed';
  };

  const filteredClasses = classes.filter(c => {
    const status = getClassStatus(c.scheduled_at, c.duration_minutes);
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'upcoming' && status === 'upcoming') ||
      (filter === 'live' && status === 'live') ||
      (filter === 'completed' && status === 'completed');
    
    return matchesFilter;
  });

  const stats = {
    total: classes.length,
    upcoming: classes.filter(c => getClassStatus(c.scheduled_at, c.duration_minutes) === 'upcoming').length,
    live: classes.filter(c => getClassStatus(c.scheduled_at, c.duration_minutes) === 'live').length,
    completed: classes.filter(c => getClassStatus(c.scheduled_at, c.duration_minutes) === 'completed').length,
  };

  // Group classes by instructor
  const classesByInstructor = filteredClasses.reduce((acc, liveClass) => {
    const instructorName = liveClass.instructor_name || 'Unknown';
    if (!acc[instructorName]) {
      acc[instructorName] = [];
    }
    acc[instructorName].push(liveClass);
    return acc;
  }, {} as Record<string, LiveClass[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading && classes.length === 0) {
    return (
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="size-12 animate-spin text-[#1E88E5] mb-4" />
          <p className="text-[#64748B] text-sm">Loading live classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Live Class Management</h1>
          <p className="text-[#64748B]">Monitor and manage all live classes across the platform</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Video className="size-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1E293B]">{stats.total}</div>
              <div className="text-xs text-[#64748B]">Total Classes</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <Calendar className="size-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1E293B]">{stats.upcoming}</div>
              <div className="text-xs text-[#64748B]">Upcoming</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="size-2 bg-red-600 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1E293B]">{stats.live}</div>
              <div className="text-xs text-[#64748B]">Live Now</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E2E8F0] p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Clock className="size-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1E293B]">{stats.completed}</div>
              <div className="text-xs text-[#64748B]">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Search and Advanced Filters */}
      <div className="space-y-4">
        {/* Search Bar with Filter Toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search by class title, course, or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent text-sm"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="size-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-[#1E88E5] text-white text-xs rounded-full">
                {[selectedInstructor, selectedCourse, dateFrom, dateTo].filter(Boolean).length}
              </span>
            )}
          </Button>
          {searchTerm && (
            <Button onClick={handleSearch}>
              Search
            </Button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1E293B]">Advanced Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#64748B] hover:text-[#1E293B] flex items-center gap-1"
                >
                  <X className="size-4" />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Instructor Filter */}
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-2">
                  Instructor
                </label>
                <select
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-sm"
                >
                  <option value="">All Instructors</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Filter */}
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-2">
                  Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-sm"
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From Filter */}
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-sm"
                />
              </div>

              {/* Date To Filter */}
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E88E5] text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#E2E8F0]">
        {[
          { key: 'upcoming' as const, label: 'Upcoming' },
          { key: 'live' as const, label: 'Live Now' },
          { key: 'completed' as const, label: 'Completed' },
          { key: 'all' as const, label: 'All Classes' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              filter === tab.key
                ? 'border-[#1E88E5] text-[#1E88E5]'
                : 'border-transparent text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Live Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F8FAFC] rounded-full mb-4">
            <Video className="size-8 text-[#CBD5E1]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
            {classes.length === 0 ? 'No Live Classes Scheduled' : `No ${filter === 'all' ? '' : filter} classes`}
          </h3>
          <p className="text-sm text-[#64748B] max-w-md mx-auto">
            {classes.length === 0
              ? 'No live classes have been scheduled yet by instructors.'
              : 'Try adjusting your search or filters to see other classes.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((liveClass) => {
            const status = getClassStatus(liveClass.scheduled_at, liveClass.duration_minutes);
            const statusConfig = {
              upcoming: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Upcoming' },
              live: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Live Now' },
              completed: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', label: 'Completed' },
            };
            
            const config = statusConfig[status];

            return (
              <div 
                key={liveClass.id} 
                className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-[#1E88E5] to-[#1565C0] overflow-hidden">
                  {liveClass.thumbnail_url ? (
                    <img 
                      src={liveClass.thumbnail_url} 
                      alt={liveClass.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Video className="size-12 text-white/50" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} flex items-center gap-1`}>
                    {status === 'live' && (
                      <div className="size-2 bg-red-600 rounded-full animate-pulse" />
                    )}
                    {config.label}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Title */}
                  <div>
                    <h3 className="font-semibold text-[#1E293B] line-clamp-2 group-hover:text-[#1E88E5] transition-colors mb-1">
                      {liveClass.title}
                    </h3>
                    <p className="text-xs text-[#64748B] flex items-center gap-1">
                      <BookOpen className="size-3" />
                      {liveClass.course_title}
                    </p>
                  </div>

                  {/* Instructor */}
                  {liveClass.instructor_name && (
                    <div className="flex items-center gap-2 text-sm text-[#64748B] bg-[#F8FAFC] px-3 py-2 rounded-lg">
                      <User className="size-4 flex-shrink-0" />
                      <span className="truncate">{liveClass.instructor_name}</span>
                    </div>
                  )}

                  {/* Description */}
                  {liveClass.description && (
                    <p className="text-sm text-[#64748B] line-clamp-2">
                      {liveClass.description}
                    </p>
                  )}

                  {/* Date & Time */}
                  <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <Calendar className="size-4 flex-shrink-0" />
                      <span>{formatDate(liveClass.scheduled_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <Clock className="size-4 flex-shrink-0" />
                      <span>{formatTime(liveClass.scheduled_at)} • {liveClass.duration_minutes} min</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <a
                      href={liveClass.meet_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1E88E5] text-white rounded-lg hover:bg-[#1565C0] transition-colors text-sm font-medium"
                    >
                      <ExternalLink className="size-4" />
                      Join
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(liveClass.id);
                      }}
                      className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] rounded-lg hover:bg-[#F8FAFC] hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
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
          <Loader2 className="size-8 animate-spin text-[#1E88E5]" />
        </div>
      </div>
    }>
      <AdminLiveClassManagementContent />
    </Suspense>
  );
}
