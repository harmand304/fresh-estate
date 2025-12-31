import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Building2, 
  Users, 
  Phone, 
  Settings,
  Search,
  User,
  Menu,
  X,
  LogOut,
  LogIn,
  UserCircle,
  ChevronDown,
  Layers
} from "lucide-react";
import logo from "@/assets/Logo - Edited.png";
import { useAuth } from "@/contexts/AuthContext";
import LogoutModal from "./LogoutModal";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isAgent, logout } = useAuth();
  
  // Check if we're on the home page (has dark hero background)
  const isHomePage = location.pathname === "/";
  
  // Use dark text styling if NOT on home page OR if scrolled
  const useDarkText = !isHomePage || scrolled;

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    // Exact match or starts with path followed by /
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  // Base nav items - Admin/Agent only visible to respective roles
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/properties", icon: Building2, label: "Properties" },
    { path: "/projects", icon: Layers, label: "Projects" },
    { path: "/agents", icon: UserCircle, label: "Agents" },
    { path: "/about", icon: Users, label: "About" },
    ...(isAgent ? [{ path: "/agent", icon: Settings, label: "Agent" }] : []),
    ...(isAdmin ? [{ path: "/admin", icon: Settings, label: "Admin" }] : []),
  ];

  // Handle search button click - navigate to home and scroll to filter
  const handleSearchClick = () => {
    if (isHomePage) {
      // If already on home page, just scroll to filters
      const filterSection = document.getElementById('property-filters');
      if (filterSection) {
        filterSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home page first
      navigate('/');
      // After navigation, scroll to filters
      setTimeout(() => {
        const filterSection = document.getElementById('property-filters');
        if (filterSection) {
          filterSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  const utilityIcons = isAuthenticated 
    ? [
        { icon: Search, title: "Search", onClick: handleSearchClick },
        { icon: LogOut, title: "Logout", onClick: handleLogout },
      ]
    : [
        { icon: Search, title: "Search", onClick: handleSearchClick },
        { icon: User, title: "Login", onClick: () => navigate('/login') },
      ];

  // Glass styles
  const glassWhite = "bg-white/20 backdrop-blur-xl border border-white/30 shadow-[0_8px_32px_rgba(255,255,255,0.1),inset_0_1px_1px_rgba(255,255,255,0.4)]";
  const glassLight = "bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)]";

  return (
    <nav className="fixed left-0 right-0 z-50 top-0">
      <div className="max-w-[98%] mx-auto px-1 pt-2">
        {/* Single unified white container - always */}
        <div
          className="relative flex items-center justify-between rounded-full px-4 py-3 bg-white shadow-lg transition-all duration-500 ease-out"
        >
          {/* Left - Logo */}
          <Link to="/" className="flex items-center group hover:scale-105 transition-transform ml-4">
            <div className="rounded-full px-4 h-12 flex items-center">
              <img
                src={logo}
                alt="Mood"
                className="h-10 w-auto object-contain scale-[2.2]"
              />
            </div>
          </Link>

          {/* Center - Navigation Items */}
          <div
            className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full px-2 h-12"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex flex-row items-center justify-center rounded-full transition-all duration-300 hover:scale-105 px-4 py-2 gap-1.5 ${
                    active
                      ? "bg-primary shadow-md"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-all duration-300 ${
                      active
                        ? "text-white"
                        : "text-slate-500 group-hover:text-primary"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium transition-all duration-300 ${
                      active
                        ? "text-white"
                        : "text-slate-500 group-hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right - Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Vertical Divider */}
            <div className="h-8 w-px bg-slate-300"></div>
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-3 rounded-full px-3 h-12 hover:bg-slate-50 transition-all duration-300"
                >
                  {/* User Info */}
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-800 leading-tight">
                      {user?.name || user?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-xs text-primary font-medium">
                      Logged in
                    </span>
                  </div>
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center overflow-hidden">
                    <UserCircle className="w-7 h-7 text-primary" />
                  </div>
                  {/* Dropdown Arrow */}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user?.email}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {user?.role}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-full px-4 h-11">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-black transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-full shadow-lg hover:bg-primary/90 hover:scale-105 transition-all duration-300"
                >
                  Join
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden flex items-center justify-center w-11 h-11 rounded-full transition-all duration-500 hover:scale-105 ${
              useDarkText
                ? "bg-slate-100/80 hover:bg-slate-200"
                : `${glassWhite} hover:bg-white/30`
            }`}
          >
            {isMobileMenuOpen ? (
              <X className={`w-5 h-5 ${useDarkText ? "text-slate-600" : "text-white/80"}`} />
            ) : (
              <Menu className={`w-5 h-5 ${useDarkText ? "text-slate-600" : "text-white/80"}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div 
            className={`md:hidden mt-3 rounded-3xl p-5 animate-in slide-in-from-top-3 duration-300 ${
              useDarkText 
                ? "bg-white/90 backdrop-blur-xl shadow-xl" 
                : "bg-slate-900/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            }`}
          >
            {/* Navigation Grid */}
            <div className="grid grid-cols-3 gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 hover:scale-105 ${
                      active
                        ? "bg-primary shadow-lg"
                        : useDarkText 
                          ? "bg-slate-100 hover:bg-slate-200" 
                          : "bg-white/5 hover:bg-white/15"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mb-2 transition-all duration-300 ${
                        active
                          ? "text-white"
                          : useDarkText 
                            ? "text-slate-600 group-hover:text-primary" 
                            : "text-white/80 group-hover:text-primary"
                      }`}
                    />
                    <span className={`text-xs font-medium ${
                      active 
                        ? "text-white" 
                        : useDarkText 
                          ? "text-slate-500 group-hover:text-primary" 
                          : "text-white/70 group-hover:text-primary"
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Buttons */}
            <div className={`flex justify-center gap-4 mt-5 pt-5 border-t ${
              useDarkText ? "border-slate-200" : "border-white/10"
            }`}>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
                    useDarkText 
                      ? "bg-slate-100 hover:bg-slate-200" 
                      : "bg-white/5 hover:bg-white/15"
                  }`}
                >
                  <UserCircle className={`w-5 h-5 mb-1 ${
                    useDarkText ? "text-slate-600" : "text-white/80"
                  }`} />
                  <span className={`text-xs ${
                    useDarkText ? "text-slate-500" : "text-white/70"
                  }`}>Logout</span>
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all ${
                       useDarkText ? "bg-slate-100 text-slate-700" : "bg-white/10 text-white"
                    }`}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg"
                  >
                    Join
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </nav>
  );
};

export default Navbar;