'use client';

import { useState, useEffect } from 'react';
import {
  Mail, Phone, MapPin, Calendar, Camera, Shield, LogOut, Loader2, Trash2, Save, User
} from 'lucide-react';
import { userService, UserProfile } from '@/services/userService';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminProfileSettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfile();
        setUser(profile);
        setFormData({
          name: profile.name,
          phone: profile.phone || '',
          location: profile.location || ''
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
        setMessage('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setMessage('Name is required.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await userService.updateProfile({
        name: formData.name,
        phone: formData.phone || undefined,
        location: formData.location || undefined
      });
      setUser(updatedUser);
      setFormData({
        name: updatedUser.name,
        phone: updatedUser.phone || '',
        location: updatedUser.location || ''
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage('All password fields are required.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage('Password must be at least 8 characters.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setChangingPassword(true);
    try {
      await userService.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Password changed successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to change password.';
      setMessage(errorMsg);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploadingPhoto(true);
    try {
      const result = await userService.uploadProfilePhoto(file);
      setUser(result.user);
      
      // Broadcast profile update event for real-time sync
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { 
          detail: { user: result.user } 
        }));
      }
      
      setMessage('Profile photo updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to upload profile photo.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user?.avatar_url) return;
    
    setUploadingPhoto(true);
    try {
      const result = await userService.deleteProfilePhoto();
      setUser(result.user);
      
      // Broadcast profile update event for real-time sync
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('profilePhotoUpdated', { 
          detail: { user: result.user } 
        }));
      }
      
      setMessage('Profile photo removed successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to remove profile photo.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = () => {
    userService.logout();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-73px)]">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin text-[#1E88E5] mx-auto mb-4" />
          <p className="text-[#78909C]">Loading profile...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.name || 'Admin';
  const email = user?.email || '';
  const role = user?.role || 'admin';
  const joinDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : 'N/A';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
          message.includes('successfully') 
            ? 'bg-[#C5E1A5] text-[#1565C0]' 
            : 'bg-[#FEE2E2] text-[#EC407A]'
        } animate-in fade-in slide-in-from-top-4`}>
          {message}
        </div>
      )}

      <h1 className="text-xl sm:text-2xl font-bold text-[#1E3A5F] mb-6">Profile Settings</h1>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-[#E0E0E0] p-4 sm:p-6 lg:p-8 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-[#F1F8E9]">
              <img 
                src={user?.avatar_url 
                  ? (user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:5001${user.avatar_url}`)
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1B8A44&color=fff&size=256`
                } 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
              className="hidden"
              id="photo-upload"
            />
            <button 
              onClick={() => document.getElementById('photo-upload')?.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-1 right-1 w-8 h-8 bg-white border border-[#E0E0E0] rounded-full flex items-center justify-center text-[#78909C] hover:text-[#1E88E5] shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {uploadingPhoto ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            </button>
            {user?.avatar_url && (
              <button
                onClick={handleDeletePhoto}
                disabled={uploadingPhoto}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 border border-white rounded-full flex items-center justify-center text-white hover:bg-red-600 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          <div className="flex-1 w-full">
            <div className="mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-[#1E3A5F] mb-2">{displayName}</h2>
              <span className="inline-block px-3 py-1 bg-[#C5E1A5] text-[#1E88E5] text-xs font-semibold rounded-md capitalize">
                {role}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FAFAFA] rounded-lg flex items-center justify-center text-[#B0BEC5] shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs text-[#B0BEC5]">Email</p>
                  <p className="text-sm font-medium text-[#1E3A5F] truncate">{email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FAFAFA] rounded-lg flex items-center justify-center text-[#B0BEC5] shrink-0">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-xs text-[#B0BEC5]">Member Since</p>
                  <p className="text-sm font-medium text-[#1E3A5F]">{joinDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={18} />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input 
                label="Full Name" 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input 
                label="Email" 
                id="email" 
                type="email" 
                value={email}
                disabled
                className="bg-gray-50"
              />
              <Input 
                label="Phone" 
                id="phone" 
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
              <Input 
                label="Location" 
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
              />
              <Button 
                type="submit" 
                className="w-full sm:w-auto"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={18} />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input 
                label="Current Password" 
                id="current" 
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                required
              />
              <Input 
                label="New Password" 
                id="new" 
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
              />
              <Input 
                label="Confirm New Password" 
                id="confirm" 
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
              />
              <Button 
                type="submit" 
                className="w-full sm:w-auto"
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Shield size={16} className="mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
