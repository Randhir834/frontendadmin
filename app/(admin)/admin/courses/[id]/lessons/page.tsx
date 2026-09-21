'use client';

import { BookOpen } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminLessonsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-blue-100 rounded-xl">
          <BookOpen size={32} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Course Lessons</h1>
          <p className="text-gray-600 mt-1">Manage lessons for this course</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Add Lesson</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Input label="Lesson Title" id="title" required />
            <Button type="submit" className="w-full sm:w-auto">Add Lesson</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Lessons List</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">Lessons will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
