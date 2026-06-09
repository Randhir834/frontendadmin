'use client';

import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function AdminPdfUploadPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-text-primary">PDF Upload</h1>
      <Card>
        <CardHeader><CardTitle>Upload Materials</CardTitle></CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-xl p-6 sm:p-10 text-center">
            <p className="text-sm text-text-muted mb-2">Drag and drop PDF, DOC, or text files here</p>
            <p className="text-xs text-text-placeholder mb-4">Max file size: 50MB</p>
            <Button variant="outline">Select Files</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
