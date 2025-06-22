import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { API_URL } from '../../config';
import {
  Users,
  UserCheck,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Eye,
  X,
} from 'lucide-react';

export default function Agents() {
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPromptPopup, setShowPromptPopup] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    systemPrompt: '',
    description: '',
  });
  const [creating, setCreating] = useState(false);

  const stats = [
    {
      title: 'Total Agents',
      value: agents.length.toString(),
      change: '+15%',
      changeType: 'positive',
      icon: Users,
    },
    {
      title: 'Active Agents',
      value: agents.filter((agent) => agent.isActive).length.toString(),
      change: '+12%',
      changeType: 'positive',
      icon: UserCheck,
    },
    {
      title: 'Performance Score',
      value: '8.7/10',
      change: '+0.3',
      changeType: 'positive',
      icon: TrendingUp,
    },
  ];

  // Fetch agents
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(`${API_URL}/agent`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }

      const result = await response.json();
      setAgents(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create agent
  const handleCreateAgent = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const token = await getToken();
      const response = await fetch(`${API_URL}/agent`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create agent');
      }

      const result = await response.json();
      setAgents([result.data, ...agents]);
      setFormData({
        name: '',
        systemPrompt: '',
        description: '',
      });
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Show system prompt popup
  const showPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setShowPromptPopup(true);
  };

  // Delete agent
  const handleDeleteAgent = async (agentId) => {
    if (!confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/agent/${agentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }

      setAgents(agents.filter((agent) => agent._id !== agentId));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const getStatusColor = (status) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const getPerformanceColor = (performance) => {
    const score = parseFloat(performance);
    if (score >= 9.0) return 'text-green-600';
    if (score >= 8.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Agents</h1>
          <p className='text-gray-600'>
            Manage and monitor your agent performance
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors'
        >
          <Plus size={20} />
          <span>{showCreateForm ? 'Cancel' : 'Add Agent'}</span>
        </button>
      </div>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      {/* Create Agent Form */}
      {showCreateForm && (
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-semibold mb-4'>Create New Agent</h2>
          <form onSubmit={handleCreateAgent} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Agent Name *
              </label>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter agent name'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                System Prompt *
              </label>
              <textarea
                name='systemPrompt'
                value={formData.systemPrompt}
                onChange={handleInputChange}
                required
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter the system prompt for this agent'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Description
              </label>
              <textarea
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter agent description (optional)'
              />
            </div>
            <div className='flex gap-4'>
              <button
                type='submit'
                disabled={creating}
                className='bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors'
              >
                {creating ? 'Creating...' : 'Create Agent'}
              </button>
              <button
                type='button'
                onClick={() => setShowCreateForm(false)}
                className='bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
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
                <div className='p-3 bg-blue-50 rounded-lg'>
                  <Icon className='text-blue-600' size={24} />
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

      {/* Search and Filters */}
      <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-lg font-semibold text-gray-900'>Agent List</h2>
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <Search
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={20}
              />
              <input
                type='text'
                placeholder='Search agents...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <button className='flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
              <Filter size={20} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-200'>
                <th className='text-left py-3 px-4 font-medium text-gray-900'>
                  Agent
                </th>
                <th className='text-left py-3 px-4 font-medium text-gray-900'>
                  System Prompt
                </th>
                <th className='text-left py-3 px-4 font-medium text-gray-900'>
                  Status
                </th>
                <th className='text-left py-3 px-4 font-medium text-gray-900'>
                  Created At
                </th>
                <th className='text-left py-3 px-4 font-medium text-gray-900'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr>
                  <td colSpan='5' className='py-8 text-center text-gray-500'>
                    No agents found. Create your first agent to get started.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr
                    key={agent._id}
                    className='border-b border-gray-100 hover:bg-gray-50'
                  >
                    <td className='py-4 px-4'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center'>
                          <span className='text-white text-sm font-medium'>
                            {agent.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {agent.name}
                          </p>
                          {agent.description && (
                            <p className='text-sm text-gray-500'>
                              {agent.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className='py-4 px-4'>
                      <div className='space-y-1'>
                        <div className='flex items-center space-x-2'>
                          <Mail size={14} className='text-gray-400' />
                          <span className='text-sm text-gray-600 max-w-xs truncate'>
                            {agent.systemPrompt}
                          </span>
                          <button
                            onClick={() => showPrompt(agent.systemPrompt)}
                            className='p-1 hover:bg-gray-100 rounded transition-colors'
                            title='View full prompt'
                          >
                            <Eye size={14} className='text-gray-600' />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className='py-4 px-4'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          agent.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='py-4 px-4'>
                      <div className='flex items-center space-x-2'>
                        <span className='text-sm text-gray-600'>
                          {new Date(agent.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className='py-4 px-4 text-right'>
                      <div className='flex items-center justify-end space-x-2'>
                        <button className='p-1 hover:bg-gray-100 rounded transition-colors'>
                          <Edit size={16} className='text-gray-600' />
                        </button>
                        <button
                          onClick={() => handleDeleteAgent(agent._id)}
                          className='p-1 hover:bg-gray-100 rounded transition-colors'
                        >
                          <Trash2 size={16} className='text-gray-600' />
                        </button>
                        <button className='p-1 hover:bg-gray-100 rounded transition-colors'>
                          <MoreVertical size={16} className='text-gray-600' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Prompt Popup */}
      {showPromptPopup && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                System Prompt
              </h3>
              <button
                onClick={() => setShowPromptPopup(false)}
                className='p-1 hover:bg-gray-100 rounded transition-colors'
              >
                <X size={20} className='text-gray-600' />
              </button>
            </div>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <pre className='whitespace-pre-wrap text-sm text-gray-800 font-mono'>
                {selectedPrompt}
              </pre>
            </div>
            <div className='mt-4 flex justify-end'>
              <button
                onClick={() => setShowPromptPopup(false)}
                className='bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors'
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
