"use client";

import { 
  ArrowLeft,
  Calendar,
  CheckCircle,
  Bell,
  Clock,
  AlertCircle,
  CheckSquare,
  Square,
  Users,
  DollarSign,
  Building,
  MapPin,
  Target
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationService } from "@/lib/notificationService";

export default function TrackBidPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const contractId = params.id as string;
  
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [alerts, setAlerts] = useState({
    email_alerts: true,
    sms_alerts: false,
    push_alerts: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sample contract data (in real app, this would come from API)
  const contract = {
    id: contractId,
    procurementRef: "POU/SUPLS/2025-2026/00013",
    title: "Supply, Installation, Migration, and Commissioning of Unified Threat Management (Firewalls)",
    client: "Parliament of Uganda",
    location: "Kampala, Uganda",
    estimatedValue: "850,000,000 UGX",
    deadline: "2024-08-29T11:00:00",
    category: "Information Technology"
  };

  const importantDates = [
    {
      id: 1,
      title: "Bid Submission Deadline",
      date: "2024-08-29",
      time: "11:00 AM EAT",
      type: "critical",
      description: "Final deadline for submitting your bid"
    },
    {
      id: 2,
      title: "Pre-bid Meeting",
      date: "2024-08-15",
      time: "10:00 AM EAT",
      type: "important",
      description: "Attend to understand requirements better"
    },
    {
      id: 3,
      title: "Site Visit",
      date: "2024-08-20",
      time: "9:00 AM EAT",
      type: "important",
      description: "Visit the project site"
    },
    {
      id: 4,
      title: "Bid Opening",
      date: "2024-09-01",
      time: "2:00 PM EAT",
      type: "info",
      description: "Public opening of all submitted bids"
    }
  ];

  // Load tracking status on component mount
  useEffect(() => {
    loadTrackingStatus();
  }, [contractId, user]);

  const loadTrackingStatus = async () => {
    if (!user) return;
    
    try {
      const trackingStatus = await NotificationService.getTrackingStatus(user.id, contractId);
      
      if (trackingStatus) {
        setTrackingEnabled(trackingStatus.tracking_active);
        setAlerts({
          email_alerts: trackingStatus.email_alerts,
          sms_alerts: trackingStatus.sms_alerts,
          push_alerts: trackingStatus.push_alerts
        });
      }
    } catch (error) {
      console.error('Error loading tracking status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTracking = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const result = await NotificationService.startTracking(user.id, contractId, alerts);
      
      if (result) {
        setTrackingEnabled(true);
        // Show success message or redirect
        router.push('/dashboard/tracking');
      }
    } catch (error) {
      console.error('Error starting tracking:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStopTracking = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const result = await NotificationService.stopTracking(user.id, contractId);
      
      if (result) {
        setTrackingEnabled(false);
        // Show success message
        alert('Bid tracking stopped successfully');
      }
    } catch (error) {
      console.error('Error stopping tracking:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePreferences = async () => {
    if (!user || !trackingEnabled) return;
    
    setSaving(true);
    try {
      const result = await NotificationService.updateTrackingPreferences(user.id, contractId, alerts);
      
      if (result) {
        // Show success message
        alert('Preferences updated successfully');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const getDateTypeColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-red-200 bg-red-50";
      case "important":
        return "border-yellow-200 bg-yellow-50";
      case "info":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-slate-200 bg-slate-50";
    }
  };

  const getDateTypeIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "important":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "info":
        return <Calendar className="h-5 w-5 text-blue-600" />;
      default:
        return <Calendar className="h-5 w-5 text-slate-600" />;
    }
  };

  const toggleAlert = (type: string) => {
    setAlerts(prev => ({
      ...prev,
      [type]: !prev[type as keyof typeof prev]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading tracking status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="h-6 w-px bg-slate-300"></div>
          <span className="text-sm text-slate-500">Tracking Bid #{contract.id}</span>
        </div>
        <div className="flex items-center space-x-3">
          {trackingEnabled ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <Bell className="h-4 w-4 mr-1" />
              Tracking Active
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
              <Bell className="h-4 w-4 mr-1" />
              Not Tracking
            </span>
          )}
        </div>
      </div>

      {/* Status Message */}
      {trackingEnabled ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-green-900 mb-2">Bid Successfully Tracked!</h2>
              <p className="text-green-800">
                You'll now receive alerts for all important dates and deadlines for this bid. 
                We'll keep you updated on key milestones and submission deadlines.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <Bell className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Start Tracking This Bid</h2>
              <p className="text-blue-800">
                Get notified about important dates and deadlines for this bid. 
                Set your alert preferences below and start tracking.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contract Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-sm font-medium text-slate-500">Ref: {contract.procurementRef}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {contract.category}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">{contract.title}</h1>
            <div className="flex items-center space-x-6 text-sm text-slate-600">
              <span className="flex items-center">
                <Building className="h-4 w-4 mr-1" />
                {contract.client}
              </span>
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {contract.location}
              </span>
              <span className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                {contract.estimatedValue}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Important Dates */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Important Dates & Alerts</h2>
          <div className="space-y-4">
            {importantDates.map((date) => (
              <div key={date.id} className={`border rounded-lg p-4 ${getDateTypeColor(date.type)}`}>
                <div className="flex items-start space-x-3">
                  {getDateTypeIcon(date.type)}
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-slate-900 mb-1">{date.title}</h3>
                    <p className="text-sm text-slate-600 mb-1">
                      {date.date} at {date.time}
                    </p>
                    <p className="text-xs text-slate-500">{date.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Settings */}
        <div className="space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Alert Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Email Alerts</p>
                    <p className="text-xs text-slate-500">Get notified via email</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAlert('email_alerts')}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    alerts.email_alerts ? 'bg-blue-600' : 'bg-slate-200'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      alerts.email_alerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">SMS Alerts</p>
                    <p className="text-xs text-slate-500">Get notified via SMS</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAlert('sms_alerts')}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    alerts.sms_alerts ? 'bg-blue-600' : 'bg-slate-200'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      alerts.sms_alerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Push Notifications</p>
                    <p className="text-xs text-slate-500">Get notified in the app</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAlert('push_alerts')}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    alerts.push_alerts ? 'bg-blue-600' : 'bg-slate-200'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      alerts.push_alerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Save Preferences Button */}
            {trackingEnabled && (
              <button
                onClick={handleUpdatePreferences}
                disabled={saving}
                className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {!trackingEnabled ? (
                <button
                  onClick={handleStartTracking}
                  disabled={saving}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Starting...' : 'Start Tracking'}
                </button>
              ) : (
                <button 
                  onClick={handleStopTracking}
                  disabled={saving}
                  className="w-full flex items-center justify-center px-4 py-3 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Stopping...' : 'Stop Tracking'}
                </button>
              )}
              
              <button className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </button>
              
              <Link
                href={`/dashboard/contracts/${contract.id}`}
                className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Target className="h-4 w-4 mr-2" />
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
