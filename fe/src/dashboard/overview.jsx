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
} from 'lucide-react';
import { Link } from 'react-router';

export default function DashboardOverview() {
  const stats = [
    {
      title: 'Total Clients',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Followups',
      value: '456',
      change: '+15%',
      changeType: 'positive',
      icon: MessageSquare,
      color: 'bg-green-500',
    },
    {
      title: 'Auto Mode Followups',
      value: '89',
      change: '+23%',
      changeType: 'positive',
      icon: Activity,
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Followups',
      value: '67',
      change: '-5%',
      changeType: 'negative',
      icon: Clock,
      color: 'bg-orange-500',
    },
  ];

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

  const recentFollowups = [
    {
      id: 1,
      clientName: 'John Smith',
      context: 'Product demo scheduled',
      status: 'pending',
      date: '2 hours ago',
      isAutoMode: true,
    },
    {
      id: 2,
      clientName: 'Sarah Johnson',
      context: 'Follow up on proposal',
      status: 'completed',
      date: '4 hours ago',
      isAutoMode: false,
    },
    {
      id: 3,
      clientName: 'Mike Wilson',
      context: 'Contract discussion',
      status: 'in_progress',
      date: '6 hours ago',
      isAutoMode: true,
    },
  ];

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
        <div className='space-y-4'>
          {recentFollowups.map((followup) => {
            const StatusIcon = getStatusIcon(followup.status);
            return (
              <div
                key={followup.id}
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
                      {followup.clientName}
                    </p>
                    {followup.isAutoMode && (
                      <span className='px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full'>
                        Auto
                      </span>
                    )}
                  </div>
                  <p className='text-sm text-gray-600'>{followup.context}</p>
                  <p className='text-xs text-gray-500'>{followup.date}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                    followup.status
                  )}`}
                >
                  {followup.status.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
