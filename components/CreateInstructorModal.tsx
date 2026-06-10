'use client';

import { useState } from 'react';
import { X, Save, Loader2, Copy, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { adminService } from '@/services/adminService';

interface CreateInstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstructorCreated: () => void;
}

export default function CreateInstructorModal({ isOpen, onClose, onInstructorCreated }: CreateInstructorModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    qualifications: '',
    specialization: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdInstructor, setCreatedInstructor] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format');
      setLoading(false);
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone is required');
      setLoading(false);
      return;
    }

    if (!formData.location.trim()) {
      setError('Location is required');
      setLoading(false);
      return;
    }

    if (!formData.qualifications.trim()) {
      setError('Qualifications are required');
      setLoading(false);
      return;
    }

    if (!formData.specialization.trim()) {
      setError('Specialization is required');
      setLoading(false);
      return;
    }

    try {
      const response = await adminService.createInstructor(formData);
      setSuccess(true);
      setCreatedInstructor(response.instructor);
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        qualifications: '',
        specialization: '',
      });
      onInstructorCreated();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create instructor account';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      location: '',
      qualifications: '',
      specialization: '',
    });
    setError(null);
    setSuccess(false);
    setCreatedInstructor(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-text-primary">Create Instructor Account</h2>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success && createdInstructor ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✓ Instructor account created successfully!</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-text-primary">Account Details</h3>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-text-muted mb-1">Instructor ID</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono font-semibold text-text-primary">{createdInstructor.id}</p>
                      <button
                        onClick={() => handleCopy(createdInstructor.id.toString(), 'id')}
                        className="text-primary-500 hover:text-primary-600 transition-colors"
                      >
                        {copiedField === 'id' ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-text-muted mb-1">Email</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono font-semibold text-text-primary">{createdInstructor.email}</p>
                      <button
                        onClick={() => handleCopy(createdInstructor.email, 'email')}
                        className="text-primary-500 hover:text-primary-600 transition-colors"
                      >
                        {copiedField === 'email' ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm text-text-muted mb-1">Temporary Password (Share with instructor)</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono font-semibold text-yellow-900">{createdInstructor.plainPassword}</p>
                      <button
                        onClick={() => handleCopy(createdInstructor.plainPassword, 'password')}
                        className="text-yellow-600 hover:text-yellow-700 transition-colors"
                      >
                        {copiedField === 'password' ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>


                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleClose} className="flex-1">
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter instructor name"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter location"
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Qualifications *
                </label>
                <textarea
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleInputChange}
                  placeholder="Enter qualifications (e.g., B.Tech in Computer Science, M.Sc in Physics)"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Specialization *
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="Enter specialization (e.g., Mathematics, Physics, Chemistry)"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handleClose}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Create Account
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
