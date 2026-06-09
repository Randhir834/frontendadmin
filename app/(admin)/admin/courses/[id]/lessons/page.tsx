'use client';

import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminLessonsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Lessons</h1>
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
