import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Clock,
  X,
  Check
} from "lucide-react";

export default function NotificationsPage() {
  // Sample notifications data
  const notifications = [
    {
      id: 1,
      title: "New contract available",
      message: "Road construction project in Jinja district - 120M UGX",
      time: "2 hours ago",
      type: "info",
      read: false,
    },
    {
      id: 2,
      title: "Bid deadline approaching",
      message: "IT infrastructure project closes in 3 days",
      time: "4 hours ago",
      type: "warning",
      read: false,
    },
    {
      id: 3,
      title: "Bid won!",
      message: "Congratulations! You won the agricultural equipment contract",
      time: "1 day ago",
      type: "success",
      read: true,
    },
    {
      id: 4,
      title: "Contract updated",
      message: "Medical supplies contract requirements have been updated",
      time: "2 days ago",
      type: "info",
      read: true,
    },
    {
      id: 5,
      title: "Bid rejected",
      message: "Your bid for the solar installation project was not selected",
      time: "3 days ago",
      type: "error",
      read: true,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <X className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-600">
            Stay updated with contract alerts and bid status
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Bell className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total</p>
              <p className="text-2xl font-semibold text-slate-900">{notifications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Unread</p>
              <p className="text-2xl font-semibold text-slate-900">
                {notifications.filter(n => !n.read).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Success</p>
              <p className="text-2xl font-semibold text-slate-900">
                {notifications.filter(n => n.type === "success").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Warnings</p>
              <p className="text-2xl font-semibold text-slate-900">
                {notifications.filter(n => n.type === "warning" || n.type === "error").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">Recent Notifications</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-6 ${!notification.read ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-900">{notification.title}</h4>
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                      <span className="text-xs text-slate-500">{notification.time}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{notification.message}</p>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button className="text-xs text-blue-600 hover:text-blue-500">
                        Mark as read
                      </button>
                    )}
                    <button className="text-xs text-slate-600 hover:text-slate-500">
                      View details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications yet</h3>
          <p className="text-slate-600 mb-6">
            You'll receive notifications about new contracts, bid updates, and deadlines
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Bell className="w-4 h-4 mr-2" />
            Configure Notifications
          </button>
        </div>
      )}
    </div>
  );
}
