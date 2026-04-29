import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from "@/config";
import { useAuth } from '@/contexts/AuthContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  User,
  Mail,
  Shield,
  Clock,
  Cookie,
  Trash2,
  Home,
  Eye,
  Camera,
  Phone,
  Save,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { compressImage } from '@/utils/compressImage';

const Profile = () => {
  const { user, setUser, isAuthenticated, logout } = useAuth();
  const { recentlyViewed, clearRecentlyViewed, cookiesAccepted } = useRecentlyViewed();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your viewing history?')) {
      clearRecentlyViewed();
    }
  };

  const handleClearCookies = () => {
    localStorage.removeItem('cookieConsent');
    localStorage.removeItem('cookieConsentDate');
    localStorage.removeItem('recentlyViewedProperties');
    window.location.reload();
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to connect to server");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Compressing and uploading image...');

    try {
      const compressedFile = await compressImage(file);
      const uploadFormData = new FormData();
      uploadFormData.append('image', compressedFile);

      // Upload to B2
      const res = await fetch(`${API_URL}/api/upload?type=user`, {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();

      if (data.success && data.key) {
        // Save the image URL to user profile
        const profileRes = await fetch(`${API_URL}/api/user/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ image: data.signedUrl }), // Storing the signedUrl directly for simplicity, or we can use the key like in the property fetching logic
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData.user);
          toast.success('Profile photo updated!', { id: toastId });
        } else {
          toast.error('Failed to update profile with new image', { id: toastId });
        }
      } else {
        toast.error('Upload failed', { id: toastId });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-slate-100 pt-20">
          <div className="text-center p-8">
            <User className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Not Logged In</h1>
            <p className="text-slate-600 mb-6">Please login to view your profile</p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          
          {/* Hero Profile Banner matching AgentProfile style */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/80 to-blue-500/80"></div>
            
            <div className="relative pt-12 flex flex-col md:flex-row gap-6 items-start md:items-end">
              {/* Profile Image with upload capability */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl flex-shrink-0 relative group bg-white">
                {user?.image ? (
                  <img src={user.image} alt={user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <User className="w-16 h-16 text-slate-300" />
                  </div>
                )}
                
                {/* Upload Overlay */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                     <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                     <Camera className="w-8 h-8 text-white mb-1" />
                  )}
                  <span className="text-white text-xs font-medium">
                    {isUploading ? 'Uploading...' : 'Change Photo'}
                  </span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Info */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-slate-900">{user?.name || 'Fresh Estates User'}</h1>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-lg flex items-center gap-1 ${
                    user?.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 
                    user?.role === 'AGENT' ? 'bg-emerald-100 text-emerald-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    <Shield className="w-4 h-4" /> {user?.role}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mt-3 flex-wrap text-slate-600">
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{user?.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pb-2 w-full md:w-auto">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full md:w-auto shadow-sm">
                     Edit Profile
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Edit Profile Form */}
              {isEditing && (
                <div className="bg-white rounded-2xl shadow-lg p-6 animate-in slide-in-from-top-4 fade-in duration-300">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Edit Personal Information
                  </h2>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          placeholder="+964 750 XXX XXXX"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input 
                          value={user?.email || ''} 
                          disabled
                          className="bg-slate-50 text-slate-500"
                        />
                        <p className="text-xs text-slate-500">Email cannot be changed currently.</p>
                      </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <Button variant="ghost" onClick={() => {
                        setIsEditing(false);
                        setFormData({ name: user?.name || '', phone: user?.phone || '' });
                      }}>Cancel</Button>
                      <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                         {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                         Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Recently Viewed History */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Recently Viewed Properties
                  </h3>
                  {recentlyViewed.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearHistory}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear History
                    </Button>
                  )}
                </div>

                {!cookiesAccepted ? (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
                    <Cookie className="w-10 h-10 mx-auto mb-3 opacity-40 text-primary" />
                    <p className="font-medium text-slate-700 mb-1">Cookies Required</p>
                    <p className="text-sm">Enable cookies to track your viewing history across the site.</p>
                  </div>
                ) : recentlyViewed.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
                    <Eye className="w-10 h-10 mx-auto mb-3 opacity-30 text-primary" />
                    <p className="font-medium text-slate-700 mb-1">No properties viewed yet</p>
                    <p className="text-sm mb-4">Start exploring the finest homes in Kurdistan.</p>
                    <Button asChild>
                      <Link to="/properties">Browse Properties</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {recentlyViewed.map((property) => (
                      <Link
                        key={property.id}
                        to={`/property/${property.id}`}
                        className="group flex gap-4 p-3 rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all bg-white"
                      >
                        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 relative">
                          {property.image ? (
                            <img
                              src={property.image}
                              alt={property.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                             <ImageIcon className="absolute inset-0 m-auto text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className="text-primary font-bold">
                            ${property.price?.toLocaleString()}
                          </p>
                          <h4 className="font-semibold text-slate-900 truncate mb-1 group-hover:text-primary transition-colors">
                            {property.title}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Home className="w-3 h-3" /> {property.city}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              
              {/* Account Settings */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-28">
                <div className="bg-slate-900 text-white p-4">
                   <h3 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4"/> Security & Settings</h3>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Cookie Settings */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Cookie className="w-4 h-4 text-slate-500" />
                      Cookie Preferences
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">
                      Cookies are <strong>{cookiesAccepted ? 'enabled' : 'disabled'}</strong>.
                      We use cookies to remember your preferences and viewing history.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCookies}
                      className="w-full"
                    >
                      Reset Cookie Consent
                    </Button>
                  </div>

                  <hr className="border-slate-100"/>

                  {/* Actions */}
                  <div>
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={() => logout()}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
