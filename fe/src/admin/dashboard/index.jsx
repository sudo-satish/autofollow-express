import {
  Building2,
  Users,
  TrendingUp,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router';

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Total Companies',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Agents',
      value: '456',
      change: '+15%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Revenue Growth',
      value: '$2.4M',
      change: '+23%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Active Sessions',
      value: '89',
      change: '+5%',
      changeType: 'positive',
      icon: Activity,
      color: 'bg-orange-500',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Companies',
      description: 'View and manage company information',
      icon: Building2,
      path: '/admin/companies',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Manage Agents',
      description: 'View and manage agent profiles',
      icon: Users,
      path: '/admin/agents',
      color: 'bg-green-50 text-green-600',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Admin Dashboard</h1>
        <p className='text-gray-600'>
          Welcome back! Here's what's happening with your system.
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
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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

      {/* Recent Activity */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <h2 className='text-lg font-semibold text-gray-900 mb-4'>
          Recent Activity
        </h2>
        <div className='space-y-4'>
          <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
            <div className='flex-1'>
              <p className='text-sm text-gray-900'>
                New company "TechCorp Solutions" was added
              </p>
              <p className='text-xs text-gray-500'>2 hours ago</p>
            </div>
          </div>
          <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
            <div className='flex-1'>
              <p className='text-sm text-gray-900'>
                Agent Sarah Johnson updated their profile
              </p>
              <p className='text-xs text-gray-500'>4 hours ago</p>
            </div>
          </div>
          <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
            <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
            <div className='flex-1'>
              <p className='text-sm text-gray-900'>
                System backup completed successfully
              </p>
              <p className='text-xs text-gray-500'>6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
