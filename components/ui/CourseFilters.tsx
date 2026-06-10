'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import Button from './Button';
import Input from './Input';

interface FilterOptions {
  search?: string;
  status?: string;
  category_id?: string;
  level?: string;
  price_range?: string;
  instructor_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

interface CourseFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  userRole: 'admin' | 'instructor' | 'student';
  categories?: Array<{ id: number; name: string }>;
  instructors?: Array<{ id: number; name: string }>;
  showAdvanced?: boolean;
}

export default function CourseFilters({
  filters,
  onFiltersChange,
  userRole,
  categories = [],
  instructors = [],
  showAdvanced = false
}: CourseFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(showAdvanced);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleSearchChange = (value: string) => {
    setLocalFilters(prev => ({ ...prev, search: value }));
    
    // Debounce search
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      onFiltersChange({ ...localFilters, search: value });
    }, 300);
    setSearchTimeout(timeout);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...localFilters, [key]: value || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterOptions = { search: localFilters.search };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.keys(localFilters).some(
    key => key !== 'search' && localFilters[key as keyof FilterOptions]
  );

  const statusOptions = userRole === 'admin' 
    ? [
        { value: '', label: 'All Status' },
        { value: 'published', label: 'Published' },
        { value: 'archived', label: 'Archived' }
      ]
    : [
        { value: '', label: 'All Status' },
        { value: 'published', label: 'Published' }
      ];

  const levelOptions = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const priceOptions = [
    { value: '', label: 'All Prices' },
    { value: 'free', label: 'Free' },
    { value: '0-1000', label: '₹0 - ₹1,000' },
    { value: '1000-5000', label: '₹1,000 - ₹5,000' },
    { value: '5000-10000', label: '₹5,000 - ₹10,000' },
    { value: '10000+', label: '₹10,000+' }
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Newest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'price', label: 'Price Low to High' },
    { value: 'enrollment_count', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B] size-4" />
        <Input
          type="text"
          placeholder="Search courses..."
          value={localFilters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <select
          value={localFilters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none "
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Level Filter */}
        <select
          value={localFilters.level || ''}
          onChange={(e) => handleFilterChange('level', e.target.value)}
          className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none "
        >
          {levelOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Sort By */}
        <select
          value={localFilters.sort_by || 'created_at'}
          onChange={(e) => handleFilterChange('sort_by', e.target.value)}
          className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none "
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="size-4" />
          More Filters
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2 text-[#64748B] hover:text-[#1E293B]"
          >
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Category
              </label>
              <select
                value={localFilters.category_id || ''}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none "
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Price Range
            </label>
            <select
              value={localFilters.price_range || ''}
              onChange={(e) => handleFilterChange('price_range', e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none "
            >
              {priceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Instructor Filter (Admin only) */}
          {userRole === 'admin' && instructors.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Instructor
              </label>
              <select
                value={localFilters.instructor_id || ''}
                onChange={(e) => handleFilterChange('instructor_id', e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none "
              >
                <option value="">All Instructors</option>
                {instructors.map(instructor => (
                  <option key={instructor.id} value={instructor.id.toString()}>
                    {instructor.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Sort Order
            </label>
            <select
              value={localFilters.sort_order || 'desc'}
              onChange={(e) => handleFilterChange('sort_order', e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none "
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}