import api from './api';
import type { StudentLead, InstructorLead, LeadsStats } from '@/types';

// ==================== Student Leads (Contact Requests & Trial Requests) ====================

/**
 * Get all student leads (combined from contact_requests and trial_requests)
 */
export const getStudentLeads = async (params?: {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<{
  leads: StudentLead[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const response = await api.get('/contact/requests', { params });
  return {
    leads: response.data.requests || [],
    pagination: response.data.pagination,
  };
};

/**
 * Get trial requests
 */
export const getTrialRequests = async (): Promise<{ trialRequests: StudentLead[] }> => {
  const response = await api.get('/trial-requests');
  return response.data;
};

/**
 * Update student lead status
 */
export const updateStudentLeadStatus = async (
  id: number,
  status: 'pending' | 'contacted' | 'completed' | 'cancelled',
  notes?: string
): Promise<{ message: string }> => {
  const response = await api.patch(`/contact/requests/${id}/status`, {
    status,
    notes,
  });
  return response.data;
};

/**
 * Get student leads statistics
 */
export const getStudentLeadsStats = async (): Promise<LeadsStats> => {
  try {
    const response = await api.get('/contact/requests', { params: { limit: 1000 } });
    const leads = response.data.requests || [];
    
    const stats = {
      total_count: leads.length,
      pending_count: leads.filter((l: StudentLead) => l.status === 'pending').length,
      contacted_count: leads.filter((l: StudentLead) => l.status === 'contacted').length,
      completed_count: leads.filter((l: StudentLead) => l.status === 'completed').length,
      cancelled_count: leads.filter((l: StudentLead) => l.status === 'cancelled').length,
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching student leads stats:', error);
    return {
      total_count: 0,
      pending_count: 0,
      contacted_count: 0,
      completed_count: 0,
      cancelled_count: 0,
    };
  }
};

/**
 * Import student leads from CSV
 */
export const importStudentLeads = async (leads: Partial<StudentLead>[]): Promise<{
  message: string;
  imported: number;
  failed: number;
}> => {
  try {
    let imported = 0;
    let failed = 0;

    for (const lead of leads) {
      try {
        await api.post('/contact/submit', {
          parentName: lead.parent_name || lead.name,
          childName: lead.child_name,
          phone: lead.phone,
          email: lead.email,
          courseInterest: lead.course_interest,
          message: lead.message,
          type: lead.type || 'general',
        });
        imported++;
      } catch (err) {
        console.error('Failed to import lead:', lead, err);
        failed++;
      }
    }

    return {
      message: `Import completed: ${imported} successful, ${failed} failed`,
      imported,
      failed,
    };
  } catch (error) {
    console.error('Error importing student leads:', error);
    throw error;
  }
};

// ==================== Instructor Leads (Instructor Registrations) ====================

/**
 * Get all instructor leads
 */
export const getInstructorLeads = async (): Promise<{ registrations: InstructorLead[] }> => {
  const response = await api.get('/instructor-registrations');
  return response.data;
};

/**
 * Get instructor lead by ID
 */
export const getInstructorLeadById = async (id: number): Promise<{ registration: InstructorLead }> => {
  const response = await api.get(`/instructor-registrations/${id}`);
  return response.data;
};

/**
 * Update instructor lead
 */
export const updateInstructorLead = async (
  id: number,
  data: Partial<InstructorLead>
): Promise<{ message: string; registration: InstructorLead }> => {
  const response = await api.put(`/instructor-registrations/${id}`, {
    fullName: data.full_name,
    qualification: data.qualification,
    subjectExpertise: data.subject_expertise,
    phoneNumber: data.phone_number,
    role: data.role,
    status: data.status,
    notes: data.notes,
  });
  return response.data;
};

/**
 * Delete instructor lead
 */
export const deleteInstructorLead = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/instructor-registrations/${id}`);
  return response.data;
};

/**
 * Get instructor leads statistics
 */
export const getInstructorLeadsStats = async (): Promise<LeadsStats> => {
  try {
    const response = await getInstructorLeads();
    const leads = response.registrations || [];
    
    const stats = {
      total_count: leads.length,
      pending_count: leads.filter((l) => l.status === 'pending' || !l.status).length,
      contacted_count: leads.filter((l) => l.status === 'contacted').length,
      accepted_count: leads.filter((l) => l.status === 'accepted').length,
      rejected_count: leads.filter((l) => l.status === 'rejected').length,
      completed_count: 0,
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching instructor leads stats:', error);
    return {
      total_count: 0,
      pending_count: 0,
      contacted_count: 0,
      completed_count: 0,
      accepted_count: 0,
      rejected_count: 0,
    };
  }
};

/**
 * Import instructor leads from CSV
 */
export const importInstructorLeads = async (leads: Partial<InstructorLead>[]): Promise<{
  message: string;
  imported: number;
  failed: number;
}> => {
  try {
    let imported = 0;
    let failed = 0;

    for (const lead of leads) {
      try {
        await api.post('/instructor-registrations', {
          fullName: lead.full_name,
          qualification: lead.qualification,
          subjectExpertise: lead.subject_expertise,
          phoneNumber: lead.phone_number,
          role: lead.role || 'instructor',
        });
        imported++;
      } catch (err) {
        console.error('Failed to import lead:', lead, err);
        failed++;
      }
    }

    return {
      message: `Import completed: ${imported} successful, ${failed} failed`,
      imported,
      failed,
    };
  } catch (error) {
    console.error('Error importing instructor leads:', error);
    throw error;
  }
};

// ==================== Export Utilities ====================

/**
 * Export student leads to CSV
 */
export const exportStudentLeadsToCSV = (leads: StudentLead[]): void => {
  const headers = ['Parent/Name', 'Child Name', 'Email', 'Phone', 'Grade', 'Course Interest', 'Type', 'Status', 'Message', 'Created Date'];
  
  const csvContent = [
    headers.join(','),
    ...leads.map(lead => [
      `"${lead.parent_name || lead.name || ''}"`,
      `"${lead.child_name || ''}"`,
      `"${lead.email}"`,
      `"${lead.phone}"`,
      `"${lead.grade || ''}"`,
      `"${lead.course_interest || ''}"`,
      `"${lead.type || ''}"`,
      `"${lead.status || 'pending'}"`,
      `"${(lead.message || '').replace(/"/g, '""')}"`,
      `"${new Date(lead.created_at).toLocaleDateString()}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `student_leads_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export instructor leads to CSV
 */
export const exportInstructorLeadsToCSV = (leads: InstructorLead[]): void => {
  const headers = ['Full Name', 'Qualification', 'Subject Expertise', 'Phone Number', 'Status', 'Notes', 'Created Date'];
  
  const csvContent = [
    headers.join(','),
    ...leads.map(lead => [
      `"${lead.full_name}"`,
      `"${lead.qualification}"`,
      `"${lead.subject_expertise}"`,
      `"${lead.phone_number}"`,
      `"${lead.status || 'pending'}"`,
      `"${(lead.notes || '').replace(/"/g, '""')}"`,
      `"${new Date(lead.created_at).toLocaleDateString()}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `instructor_leads_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
