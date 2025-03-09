import React, { useEffect, useRef } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Bell, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const NotificationPanel: React.FC = () => {
  const { notifications, acknowledgeNotification } = useSimulation();
  const notificationEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new notifications arrive
  useEffect(() => {
    if (notificationEndRef.current) {
      notificationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [notifications]);
  
  const getNotificationIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notifications
        </h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {notifications.length}
        </span>
      </div>
      
      <div className="h-64 overflow-y-auto pr-2">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-md border-l-4 ${
                  notification.read ? 'bg-gray-50' : 'bg-white'
                } ${
                  notification.level === 'info'
                    ? 'border-blue-500'
                    : notification.level === 'warning'
                    ? 'border-amber-500'
                    : notification.level === 'error'
                    ? 'border-red-500'
                    : 'border-green-500'
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    {getNotificationIcon(notification.level)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {notification.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    
                    {!notification.read && (
                      <button
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                        onClick={() => acknowledgeNotification(notification.id)}
                      >
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={notificationEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
