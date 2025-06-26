import {
  Users,
  MessageSquare,
  TrendingUp,
  Activity,
  ArrowRight,
  UserPlus,
  Phone,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import useCompany from '../hooks/useCompany';
import { API_URL } from '../config';

export default function DashboardOverview() {
  const { getToken } = useAuth();
  const { company } = useCompany();
  const [recentFollowups, setRecentFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContextPopup, setShowContextPopup] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState(null);

  const quickActions = [
    {
      title: 'Add New Client',
      description: 'Create a new client profile',
      icon: UserPlus,
      path: '/dashboard/clients/new',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Create Followup',
      description: 'Schedule a new followup',
      icon: MessageSquare,
      path: '/dashboard/followups/new',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'View Clients',
      description: 'Manage all client profiles',
      icon: Users,
      path: '/dashboard/clients',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Followup History',
      description: 'View all followup activities',
      icon: Calendar,
      path: '/dashboard/followups',
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  // Fetch recent followups
  useEffect(() => {
    const fetchRecentFollowups = async () => {
      if (!company?._id) return;

      try {
        setLoading(true);
        const token = await getToken();
        const response = await fetch(
          `${API_URL}/company/${company._id}/followups`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch followups');
        }

        const data = await response.json();
        // Get the 5 most recent followups
        const recent = data.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentFollowups(recent);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching recent followups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentFollowups();
  }, [company?._id, getToken]);

  // Calculate stats based on followups data
  const calculateStats = () => {
    if (!recentFollowups.length) {
      return [
        {
          title: 'Total Clients',
          value: '0',
          change: '+0%',
          changeType: 'positive',
          icon: Users,
          color: 'bg-blue-500',
        },
        {
          title: 'Active Followups',
          value: '0',
          change: '+0%',
          changeType: 'positive',
          icon: MessageSquare,
          color: 'bg-green-500',
        },
        {
          title: 'Auto Mode Followups',
          value: '0',
          change: '+0%',
          changeType: 'positive',
          icon: Activity,
          color: 'bg-purple-500',
        },
        {
          title: 'Pending Followups',
          value: '0',
          change: '+0%',
          changeType: 'positive',
          icon: Clock,
          color: 'bg-orange-500',
        },
      ];
    }

    // Get all followups for stats calculation
    const allFollowups = recentFollowups; // In a real app, you'd fetch all followups for stats

    const totalClients = new Set(allFollowups.map((f) => f.clientId?._id)).size;
    const activeFollowups = allFollowups.filter(
      (f) => f.status === 'in_progress'
    ).length;
    const autoModeFollowups = allFollowups.filter((f) => f.isAutoMode).length;
    const pendingFollowups = allFollowups.filter(
      (f) => f.status === 'pending'
    ).length;

    return [
      {
        title: 'Total Clients',
        value: totalClients.toString(),
        change: '+12%',
        changeType: 'positive',
        icon: Users,
        color: 'bg-blue-500',
      },
      {
        title: 'Active Followups',
        value: activeFollowups.toString(),
        change: '+15%',
        changeType: 'positive',
        icon: MessageSquare,
        color: 'bg-green-500',
      },
      {
        title: 'Auto Mode Followups',
        value: autoModeFollowups.toString(),
        change: '+23%',
        changeType: 'positive',
        icon: Activity,
        color: 'bg-purple-500',
      },
      {
        title: 'Pending Followups',
        value: pendingFollowups.toString(),
        change: '-5%',
        changeType: 'negative',
        icon: Clock,
        color: 'bg-orange-500',
      },
    ];
  };

  const stats = calculateStats();

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in_progress':
        return Clock;
      case 'pending':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const handleShowContext = (followup) => {
    setSelectedFollowup(followup);
    setShowContextPopup(true);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
        <p className='text-gray-600'>
          Welcome back! Here's what's happening with your clients and followups.
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    {stat.title}
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <Icon
                    className={stat.color.replace('bg-', 'text-')}
                    size={24}
                  />
                </div>
              </div>
              <div className='mt-4'>
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
                <span className='text-sm text-gray-600 ml-1'>
                  from last month
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>
          Quick Actions
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.path}
                className='p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 group'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className='font-medium text-gray-900 group-hover:text-blue-600 transition-colors'>
                        {action.title}
                      </h3>
                      <p className='text-sm text-gray-600'>
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={20}
                    className='text-gray-400 group-hover:text-blue-600 transition-colors'
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Followups */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Recent Followups
          </h2>
          <Link
            to='/dashboard/followups'
            className='text-blue-600 hover:text-blue-700 text-sm font-medium'
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            <span className='ml-2 text-gray-600'>Loading followups...</span>
          </div>
        ) : error ? (
          <div className='flex items-center justify-center py-8 text-red-600'>
            <AlertCircle size={20} className='mr-2' />
            <span>Error loading followups: {error}</span>
          </div>
        ) : recentFollowups.length === 0 ? (
          <div className='flex items-center justify-center py-8 text-gray-500'>
            <MessageSquare size={20} className='mr-2' />
            <span>No followups found</span>
          </div>
        ) : (
          <div className='space-y-4'>
            {recentFollowups.map((followup) => {
              const StatusIcon = getStatusIcon(followup.status);
              return (
                <div
                  key={followup._id}
                  className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'
                >
                  <StatusIcon
                    size={16}
                    className={getStatusColor(followup.status).replace(
                      'bg-',
                      'text-'
                    )}
                  />
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2'>
                      <p className='text-sm font-medium text-gray-900'>
                        {followup.clientId?.name || 'Unknown Client'}
                      </p>
                      {followup.isAutoMode && (
                        <span className='px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full'>
                          Auto
                        </span>
                      )}
                    </div>
                    <div className='flex items-center space-x-2 mt-1'>
                      <p className='text-xs text-gray-500'>
                        {formatDate(followup.createdAt)}
                      </p>
                      <button
                        onClick={() => handleShowContext(followup)}
                        className='text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors'
                      >
                        View Context
                      </button>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        followup.status
                      )}`}
                    >
                      {followup.status.replace('_', ' ')}
                    </span>
                    <Link
                      to={`/dashboard/followups/${followup._id}`}
                      className='text-xs text-green-600 hover:text-green-700 font-medium hover:underline transition-colors'
                    >
                      View Followup
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Context Popup */}
      {showContextPopup && selectedFollowup && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Followup Context
              </h3>
              <button
                onClick={() => setShowContextPopup(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X size={20} />
              </button>
            </div>
            <div className='bg-gray-50 rounded-lg p-4'>
              <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                {selectedFollowup.context}
              </p>
            </div>
            <div className='mt-4 flex justify-end'>
              <button
                onClick={() => setShowContextPopup(false)}
                className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
