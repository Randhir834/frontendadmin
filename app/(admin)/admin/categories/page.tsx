'use client';

import { useEffect, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { categoryService } from '@/services/categoryService';
import type { Category } from '@/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoryService.getCategories().then((data) => setCategories(data.categories)).catch(() => setCategories([]));
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-purple-100 rounded-xl">
          <FolderOpen size={32} className="text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">Organize and manage course categories</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Category List</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.length === 0 && <p className="text-sm text-text-muted">No categories found.</p>}
            {categories.map((c) => (
              <div key={c.id} className="border-b border-border-soft py-2">
                <p className="text-sm font-medium text-text-primary">{c.name}</p>
                {c.description && <p className="text-xs text-text-muted">{c.description}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
