import { LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal = ({ isOpen, onConfirm, onCancel }: LogoutModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-8 h-8 text-red-600" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
          Log Out?
        </h3>
        <p className="text-slate-600 text-center mb-6">
          Are you sure you want to log out of your account?
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
