import { Link } from 'react-router-dom';
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
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { recentlyViewed, clearRecentlyViewed, cookiesAccepted } = useRecentlyViewed();

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-slate-100 pt-28 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* User Info Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{user?.name || 'User'}</h2>
                  <p className="text-slate-600">{user?.email}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="w-5 h-5" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Shield className="w-5 h-5" />
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      user?.role === 'ADMIN' 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user?.role}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => logout()}
                  >
                    Logout
                  </Button>
                </div>
              </div>

              {/* Cookie Settings */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Cookie className="w-5 h-5" />
                  Cookie Settings
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Cookies are {cookiesAccepted ? 'enabled' : 'disabled'}. 
                  {cookiesAccepted && ' We use cookies to remember your preferences and viewing history.'}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearCookies}
                  className="w-full"
                >
                  Reset Cookie Preferences
                </Button>
              </div>
            </div>

            {/* Recently Viewed */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recently Viewed Properties
                  </h3>
                  {recentlyViewed.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleClearHistory}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {!cookiesAccepted ? (
                  <div className="text-center py-8 text-slate-500">
                    <Cookie className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Enable cookies to track your viewing history</p>
                  </div>
                ) : recentlyViewed.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No properties viewed yet</p>
                    <Button asChild className="mt-4">
                      <Link to="/properties">Browse Properties</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentlyViewed.map((property) => (
                      <Link
                        key={property.id}
                        to={`/property/${property.id}`}
                        className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                          {property.image && (
                            <img
                              src={property.image}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 truncate">
                            {property.title}
                          </h4>
                          <p className="text-sm text-slate-600">{property.city}</p>
                          <p className="text-primary font-semibold">
                            ${property.price?.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Home className="w-5 h-5 text-slate-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
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
