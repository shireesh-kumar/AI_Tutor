import React, {useEffect } from 'react';
import { AlertTriangle, XCircle, CheckCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type?: 'error' | 'warning' | 'success' | 'info';
  message: string;
  isVisible?: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const Alert: React.FC<AlertProps> = ({ 
  type = 'info', 
  message, 
  isVisible = false, 
  onClose,
  autoClose = false,
  autoCloseDelay = 8000 
}) => {
  // Auto close functionality
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose]);

  const handleClose = () => {
    onClose && onClose();
  };

  if (!isVisible) return null;

  const alertStyles = {
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: XCircle
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      icon: AlertTriangle
    },
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      icon: CheckCircle
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: Info
    }
  };

  const style = alertStyles[type];
  const IconComponent = style.icon;

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 ${style.bg} ${style.border} border backdrop-blur-sm rounded-xl p-4 shadow-lg transition-all duration-300`}>
      <div className="flex items-start gap-3">
        <IconComponent className={`${style.text} mt-0.5 flex-shrink-0`} size={20} />
        <p className={`${style.text} flex-1 text-sm font-medium`}>
          {message}
        </p>
        {onClose && (
          <button
            onClick={handleClose}
            className={`${style.text} hover:opacity-70 transition-opacity flex-shrink-0 cursor-pointer`}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;