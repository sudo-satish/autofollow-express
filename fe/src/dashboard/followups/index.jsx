import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import useCompany from '../../hooks/useCompany';
import { API_URL } from '../../config';

export default function Followups() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [followups, setFollowups] = useState([]);
  const { user } = useUser();
  const { getToken, orgId } = useAuth();

  const { company, setCompany, loading } = useCompany();

  console.log(user, orgId, company);

  useEffect(() => {
    const fetchFollowups = async () => {
      console.log({ company });
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
      const data = await response.json();
      //   setFollowups([]);
      setFollowups(data.data);
    };

    if (company?._id) {
      fetchFollowups();
    }
  }, [company?._id]);

  // Mock data - replace with actual API calls

  const filteredFollowups = followups.filter((followup) => {
    const matchesSearch =
      (followup.clientId?.name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      followup.context.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (followup.agentId?.name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (followup.companyId?.name || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || followup.status === selectedStatus;
    const matchesMode =
      selectedMode === 'all' ||
      (selectedMode === 'auto' && followup.isAutoMode) ||
      (selectedMode === 'manual' && !followup.isAutoMode);

    return matchesSearch && matchesStatus && matchesMode;
  });

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
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const handleDelete = async (followupId) => {
    const token = await getToken();
    const response = await fetch(
      `${API_URL}/company/${company._id}/followups/${followupId}`,
      {
        method: 'DELETE',
      }
    );
    if (response.ok) {
      setFollowups(followups.filter((f) => f._id !== followupId));
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Followups</h1>
          <p className='text-gray-600'>
            Manage client followups and communication tracking
          </p>
        </div>
        <Link
          to='/dashboard/followups/new'
          className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          <Plus size={20} className='mr-2' />
          Create Followup
        </Link>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='p-3 bg-blue-100 rounded-lg'>
              <MessageSquare className='text-blue-600' size={24} />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Total Followups
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {followups.length}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='p-3 bg-green-100 rounded-lg'>
              <CheckCircle className='text-green-600' size={24} />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Completed</p>
              <p className='text-2xl font-bold text-gray-900'>
                {followups.filter((f) => f.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='p-3 bg-purple-100 rounded-lg'>
              <Zap className='text-purple-600' size={24} />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Auto Mode</p>
              <p className='text-2xl font-bold text-gray-900'>
                {followups.filter((f) => f.isAutoMode).length}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='p-3 bg-orange-100 rounded-lg'>
              <Clock className='text-orange-600' size={24} />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Pending</p>
              <p className='text-2xl font-bold text-gray-900'>
                {followups.filter((f) => f.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <Search
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={20}
              />
              <input
                type='text'
                placeholder='Search followups by client, context, or agent...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <Filter size={20} className='text-gray-400' />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='all'>All Status</option>
                <option value='pending'>Pending</option>
                <option value='in_progress'>In Progress</option>
                <option value='completed'>Completed</option>
              </select>
            </div>
            <div className='flex items-center space-x-2'>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='all'>All Modes</option>
                <option value='auto'>Auto Mode</option>
                <option value='manual'>Manual Mode</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Followups Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Client & Context
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Agent
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Company
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Mode
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Updated
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredFollowups.map((followup) => {
                const StatusIcon = getStatusIcon(followup.status);
                return (
                  <tr key={followup._id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center'>
                        <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                          <span className='text-blue-600 font-medium'>
                            {followup.clientId?.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>
                            {followup.clientId?.name}
                          </div>
                          <div className='text-sm text-gray-500 max-w-xs truncate'>
                            {followup.context}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <Users size={16} className='text-gray-400 mr-2' />
                        <span className='text-sm text-gray-900'>
                          {followup.agentId?.name}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <Building2 size={16} className='text-gray-400 mr-2' />
                        <span className='text-sm text-gray-900'>
                          {followup.companyId?.name}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <StatusIcon
                          size={16}
                          className={getStatusColor(followup.status).replace(
                            'bg-',
                            'text-'
                          )}
                        />
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(
                            followup.status
                          )}`}
                        >
                          {followup.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {followup.isAutoMode ? (
                        <span className='px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full flex items-center'>
                          <Zap size={12} className='mr-1' />
                          Auto
                        </span>
                      ) : (
                        <span className='px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full'>
                          Manual
                        </span>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(followup.updatedAt)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex items-center justify-end space-x-2'>
                        <Link
                          to={`/dashboard/followups/${followup._id}`}
                          className='text-blue-600 hover:text-blue-900 p-1'
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/dashboard/followups/${followup._id}/edit`}
                          className='text-green-600 hover:text-green-900 p-1'
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          className='text-red-600 hover:text-red-900 p-1'
                          onClick={() => handleDelete(followup._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredFollowups.length === 0 && (
          <div className='text-center py-12'>
            <MessageSquare size={48} className='mx-auto text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No followups found
            </h3>
            <p className='text-gray-600 mb-4'>
              {searchTerm || selectedStatus !== 'all' || selectedMode !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first followup'}
            </p>
            {!searchTerm &&
              selectedStatus === 'all' &&
              selectedMode === 'all' && (
                <Link
                  to='/dashboard/followups/new'
                  className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <Plus size={20} className='mr-2' />
                  Create Followup
                </Link>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
