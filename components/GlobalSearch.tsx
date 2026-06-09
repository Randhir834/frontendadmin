'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X, Loader2, BookOpen, FileText, Video, Users, Folder, GraduationCap, Shapes, UserCheck } from 'lucide-react';
import { searchService, SearchResponse } from '@/services/searchService';

interface GlobalSearchProps {
  initialQuery?: string;
  className?: string;
}

// Extract context from current URL path
const getSearchContext = (pathname: string) => {
  // Match patterns like /admin/courses/123, /admin/students, etc.
  const courseMatch = pathname.match(/\/courses\/(\d+)/);
  const studentMatch = pathname.match(/\/students/);
  const instructorMatch = pathname.match(/\/instructors\/(\d+)/);
  const assignmentMatch = pathname.match(/\/assignments/);
  const quizMatch = pathname.match(/\/quizzes/);
  const categoryMatch = pathname.match(/\/categories/);
  const enrollmentMatch = pathname.match(/\/enrollments/);
  
  if (courseMatch) {
    return { type: 'course', id: parseInt(courseMatch[1]) };
  } else if (instructorMatch) {
    return { type: 'instructor', id: parseInt(instructorMatch[1]) };
  } else if (studentMatch) {
    return { type: 'student', id: null };
  } else if (assignmentMatch) {
    return { type: 'assignment', id: null };
  } else if (quizMatch) {
    return { type: 'quiz', id: null };
  } else if (categoryMatch) {
    return { type: 'category', id: null };
  } else if (enrollmentMatch) {
    return { type: 'enrollment', id: null };
  }
  
  return { type: null, id: null };
};

export default function GlobalSearch({ initialQuery = '', className = '' }: GlobalSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search with debounce
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length === 0) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const context = getSearchContext(pathname || '');
        const searchResults = await searchService.globalSearch(query, context.type, context.id);
        setResults(searchResults);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, pathname]);

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleResultClick = (type: string, id: number) => {
    setIsOpen(false);
    setQuery('');
    
    // Navigate based on result type
    switch (type) {
      case 'course':
        router.push(`/admin/courses/${id}`);
        break;
      case 'lesson':
        router.push(`/admin/courses/${results?.results.lessons.find(l => l.id === id)?.course_id}/lessons`);
        break;
      case 'section':
        router.push(`/admin/courses/${results?.results.sections.find(s => s.id === id)?.course_id}/sections`);
        break;
      case 'assignment':
        router.push(`/admin/assignments`);
        break;
      case 'quiz':
        router.push(`/admin/quizzes`);
        break;
      case 'live_class':
        router.push(`/admin/live-class-management`);
        break;
      case 'user':
        const user = results?.results.users.find(u => u.id === id);
        if (user?.role === 'student') {
          router.push(`/admin/students`);
        } else if (user?.role === 'instructor') {
          router.push(`/admin/instructors/${id}`);
        }
        break;
      case 'category':
        router.push(`/admin/categories`);
        break;
      case 'enrollment':
        router.push(`/admin/enrollments`);
        break;
      default:
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="text-[#1E88E5]" size={18} />;
      case 'lesson':
        return <Video className="text-[#1E88E5]" size={18} />;
      case 'section':
        return <Folder className="text-[#8B5CF6]" size={18} />;
      case 'assignment':
        return <FileText className="text-[#FFA726]" size={18} />;
      case 'quiz':
        return <FileText className="text-[#EF4444]" size={18} />;
      case 'live_class':
        return <Video className="text-[#EC4899]" size={18} />;
      case 'user':
        return <Users className="text-[#6366F1]" size={18} />;
      case 'category':
        return <Shapes className="text-[#10B981]" size={18} />;
      case 'enrollment':
        return <UserCheck className="text-[#14B8A6]" size={18} />;
      default:
        return <Search className="text-[#78909C]" size={18} />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      course: 'Course',
      lesson: 'Lesson',
      section: 'Section',
      assignment: 'Assignment',
      quiz: 'Quiz',
      live_class: 'Live Class',
      user: 'User',
      category: 'Category',
      enrollment: 'Enrollment',
    };
    return labels[type] || type;
  };

  const renderResultItem = (item: any, type: string) => {
    return (
      <button
        key={`${type}-${item.id}`}
        onClick={() => handleResultClick(type, item.id)}
        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#FAFAFA] transition-colors text-left border-b border-[#E0E0E0] last:border-b-0"
      >
        <div className="mt-0.5 shrink-0">{getIcon(type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-medium text-[#78909C] uppercase tracking-wide">
              {getTypeLabel(type)}
            </span>
            {item.status && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                item.status === 'published' || item.status === 'active' || item.status === 'completed'
                  ? 'bg-[#D1FAE5] text-[#065F46]'
                  : item.status === 'draft'
                  ? 'bg-[#FEF3C7] text-[#92400E]'
                  : 'bg-[#E5E7EB] text-[#374151]'
              }`}>
                {item.status}
              </span>
            )}
            {item.level && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E0E7FF] text-[#4338CA]">
                {item.level}
              </span>
            )}
            {item.role && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#1E40AF]">
                {item.role}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-[#1E3A5F] mb-1 truncate">
            {item.title || item.name || item.user_name || `${type} #${item.id}`}
          </p>
          {item.description && (
            <p className="text-xs text-[#78909C] line-clamp-2">{item.description}</p>
          )}
          {item.email && (
            <p className="text-xs text-[#78909C] mt-1">✉️ {item.email}</p>
          )}
          {item.phone && (
            <p className="text-xs text-[#78909C] mt-1">📞 {item.phone}</p>
          )}
          {item.school && (
            <p className="text-xs text-[#78909C] mt-1">🏫 {item.school}</p>
          )}
          {item.location && (
            <p className="text-xs text-[#78909C] mt-1">📍 {item.location}</p>
          )}
          {item.course_title && type !== 'course' && (
            <p className="text-xs text-[#78909C] mt-1">📚 {item.course_title}</p>
          )}
          {item.category_name && (
            <p className="text-xs text-[#78909C] mt-1">🏷️ {item.category_name}</p>
          )}
          {item.duration && (
            <p className="text-xs text-[#78909C] mt-1">⏱️ {item.duration} min</p>
          )}
          {item.price !== undefined && item.price !== null && (
            <p className="text-xs font-semibold text-[#1E88E5] mt-1">
              {item.price === 0 ? 'Free' : `₹${item.price}`}
            </p>
          )}
          {item.course_count !== undefined && (
            <p className="text-xs text-[#78909C] mt-1">📚 {item.course_count} courses</p>
          )}
        </div>
      </button>
    );
  };

  const hasResults = results && results.totalResults > 0;
  
  // Get context-aware placeholder
  const getPlaceholder = () => {
    const context = getSearchContext(pathname || '');
    if (context.type === 'course') {
      return 'Search in this course...';
    } else if (context.type === 'student') {
      return 'Search students...';
    } else if (context.type === 'instructor') {
      return 'Search instructors...';
    } else if (context.type === 'assignment') {
      return 'Search assignments...';
    } else if (context.type === 'quiz') {
      return 'Search quizzes...';
    } else if (context.type === 'category') {
      return 'Search categories...';
    } else if (context.type === 'enrollment') {
      return 'Search enrollments...';
    }
    return 'Search for anything: courses, students, phone numbers...';
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 sm:left-3.5 top-1/2 transform -translate-y-1/2 text-[#B0BEC5] size-4 sm:size-[18px]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() && results) {
              setIsOpen(true);
            }
          }}
          className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-1 sm:py-1.5 bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#1E88E5] focus:border-transparent"
        />
        {(query || isLoading) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {isLoading && <Loader2 className="text-[#1E88E5] animate-spin" size={18} />}
            {query && !isLoading && (
              <button
                onClick={handleClear}
                className="text-[#78909C] hover:text-[#1E3A5F] transition-colors"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && hasResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E0E0E0] rounded-lg shadow-xl max-h-[70vh] overflow-y-auto z-50">
          <div className="sticky top-0 bg-white border-b border-[#E0E0E0] px-4 py-3">
            <p className="text-sm font-semibold text-[#1E3A5F]">
              Found {results.totalResults} result{results.totalResults !== 1 ? 's' : ''} for "{query}"
            </p>
            {getSearchContext(pathname || '').type && (
              <p className="text-xs text-[#78909C] mt-1">
                🎯 Prioritizing results from current page
              </p>
            )}
          </div>

          <div className="py-2">
            {results.results.courses.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-[#FAFAFA] border-b border-[#E0E0E0]">
                  <p className="text-xs font-semibold text-[#78909C] uppercase tracking-wide">
                    Courses
                  </p>
                </div>
                {results.results.courses.map((item) => renderResultItem(item, 'course'))}
              </div>
            )}
            {results.results.sections.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-[#FAFAFA] border-b border-[#E0E0E0]">
                  <p className="text-xs font-semibold text-[#78909C] uppercase tracking-wide">
                    Sections
                  </p>
                </div>
                {results.results.sections.map((item) => renderResultItem(item, 'section'))}
              </div>
            )}
            {results.results.lessons.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-[#FAFAFA] border-b border-[#E0E0E0]">
                  <p className="text-xs font-semibold text-[#78909C] uppercase tracking-wide">
                    Lessons
                  </p>
                </div>
                {results.results.lessons.map((item) => renderResultItem(item, 'lesson'))}
              </div>
            )}
            {results.results.assignments.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-[#FAFAFA] border-b border-[#E0E0E0]">
                  <p className="text-xs font-semibold text-[#78909C] uppercase tracking-wide">
                    Assignments
                  </p>
                </div>
                {results.results.assignments.map((item) => renderResultItem(item, 'assignment'))}
              </div>
            )}
            {results.results.quizzes.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-[#FAFAFA] border-b border-[#E0E0E0]">
                  <p className="text-xs font-semibold text-[#78909C] uppercase tracking-wide">
                    Quizzes
                  </p>
                </div>
                {results.results.quizzes.map((item) => renderResultItem(item, 'quiz'))}
              </div>
            )}
            {results.results.liveClasses.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-[#FAFAFA] border-b border-[#E0E0E0]">
                  <p className="text-xs font-semibold text-[#78909C] uppercase tracking-wide">
                    Live Classes
                  </p>
                </div>
                {results.results.liveClasses.map((item) => renderResultItem(item, 'live_class'))}
              </div>
            )}
            {results.results.users.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-[#FAFAFA] border-b border-[#E0E0E0]">
                  <p className="text-xs font-semibold text-[#78909C] uppercase tracking-wide">
                    Users
                  </p>
                </div>
                {results.results.users.map((item) => renderResultItem(item, 'user'))}
              </div>
            )}
            {results.results.categories.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-[#FAFAFA] border-b border-[#E0E0E0]">
                  <p className="text-xs font-semibold text-[#78909C] uppercase tracking-wide">
                    Categories
                  </p>
                </div>
                {results.results.categories.map((item) => renderResultItem(item, 'category'))}
              </div>
            )}
            {results.results.enrollments.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-[#FAFAFA] border-b border-[#E0E0E0]">
                  <p className="text-xs font-semibold text-[#78909C] uppercase tracking-wide">
                    Enrollments
                  </p>
                </div>
                {results.results.enrollments.map((item) => renderResultItem(item, 'enrollment'))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && results && !hasResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E0E0E0] rounded-lg shadow-xl p-8 text-center z-50">
          <Search className="mx-auto text-[#E0E0E0] mb-3" size={48} />
          <p className="text-sm font-semibold text-[#1E3A5F] mb-1">No results found</p>
          <p className="text-xs text-[#78909C]">Try searching with different keywords</p>
        </div>
      )}
    </div>
  );
}
