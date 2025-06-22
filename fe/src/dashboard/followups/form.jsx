import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import {
  ArrowLeft,
  Save,
  MessageSquare,
  Users,
  Building2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { API_URL } from '../../config';

export default function FollowupForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { getToken, orgId } = useAuth();

  const [formData, setFormData] = useState({
    clientId: '',
    companyId: '',
    agentId: '',
    context: '',
    isAutoMode: false,
    status: 'pending',
    followupDateTime: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState(null);
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch company details using orgId
  useEffect(() => {
    const fetchCompany = async () => {
      if (!orgId) return;

      try {
        setLoadingData(true);
        const token = await getToken();
        const response = await fetch(`${API_URL}/company/org/${orgId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch company details');
        }

        const data = await response.json();
        if (data.success) {
          setCompany(data.data);
          setFormData((prev) => ({ ...prev, companyId: data.data._id }));
          console.log('Company details:', data.data);
        } else {
          setErrors({
            submit: data.message || 'Failed to fetch company details',
          });
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        setErrors({ submit: err.message });
      } finally {
        setLoadingData(false);
      }
    };

    fetchCompany();
  }, [orgId, getToken]);

  // Fetch clients and agents for the company
  useEffect(() => {
    const fetchData = async () => {
      if (!company) return;

      try {
        const token = await getToken();

        // Fetch clients
        const clientsResponse = await fetch(
          `${API_URL}/company/${company._id}/clients`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json();
          setClients(clientsData.data || []);
        }

        // Fetch agents (using company agents)
        if (company.agents && company.agents.length > 0) {
          setAgents(company.agents);
        } else {
          // Mock agents if none available
          setAgents([
            { _id: 'agent_001', name: 'Sarah Johnson' },
            { _id: 'agent_002', name: 'Mike Wilson' },
            { _id: 'agent_003', name: 'David Brown' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [company, getToken]);

  // Load followup data if editing
  useEffect(() => {
    if (isEditing && company) {
      // Mock followup data - replace with actual API call
      const mockFollowup = {
        id: 1,
        clientId: clients.length > 0 ? clients[0]._id : '',
        companyId: company._id,
        agentId: agents.length > 0 ? agents[0]._id : '',
        context: 'Product demo scheduled for next week',
        isAutoMode: true,
        status: 'pending',
        followupDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16), // 7 days from now
      };
      setFormData(mockFollowup);
    }
  }, [isEditing, company, clients, agents]);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Company is required';
    }

    if (!formData.agentId) {
      newErrors.agentId = 'Agent is required';
    }

    if (!formData.context.trim()) {
      newErrors.context = 'Context is required';
    }

    if (!formData.followupDateTime) {
      newErrors.followupDateTime = 'Followup date and time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = await getToken();
      const url = isEditing
        ? `${API_URL}/company/${company._id}/followups/${id}`
        : `${API_URL}/company/${company._id}/followups`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save followup');
      }

      const data = await response.json();
      if (data.success) {
        navigate('/dashboard/followups');
      } else {
        setErrors({ submit: data.message || 'Failed to save followup' });
      }
    } catch (error) {
      console.error('Error saving followup:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleClientChange = (clientId) => {
    setFormData((prev) => ({
      ...prev,
      clientId: clientId,
    }));
    if (errors.clientId) {
      setErrors((prev) => ({ ...prev, clientId: '' }));
    }
  };

  if (loadingData) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className='space-y-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-center'>
            <AlertCircle className='text-red-400 mr-2' size={20} />
            <span className='text-red-800'>
              {errors.submit ||
                'Company not found. Please contact your administrator.'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Link
            to='/dashboard/followups'
            className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              {isEditing ? 'Edit Followup' : 'Create New Followup'}
            </h1>
            <p className='text-gray-600'>
              {isEditing
                ? 'Update followup information'
                : 'Schedule a new followup with a client'}
              <span className='ml-2 text-blue-600'>• {company.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {errors.submit && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
              <div className='flex items-center'>
                <AlertCircle className='text-red-400 mr-2' size={20} />
                <span className='text-red-800'>{errors.submit}</span>
              </div>
            </div>
          )}

          {/* Client Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <Users size={16} className='inline mr-2' />
              Client *
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.clientId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value=''>Select a client</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className='mt-1 text-sm text-red-600'>{errors.clientId}</p>
            )}
            {clients.length === 0 && (
              <p className='mt-1 text-sm text-yellow-600'>
                No clients available. Please add clients first.
              </p>
            )}
          </div>

          {/* Company Field (Read-only) */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <Building2 size={16} className='inline mr-2' />
              Company *
            </label>
            <input
              type='text'
              value={company.name}
              disabled
              className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600'
            />
            <p className='mt-1 text-sm text-gray-500'>
              Followup will be associated with {company.name}
            </p>
          </div>

          {/* Agent Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <Users size={16} className='inline mr-2' />
              Agent *
            </label>
            <select
              value={formData.agentId}
              onChange={(e) => handleChange('agentId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.agentId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value=''>Select an agent</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name}
                </option>
              ))}
            </select>
            {errors.agentId && (
              <p className='mt-1 text-sm text-red-600'>{errors.agentId}</p>
            )}
          </div>

          {/* Context */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <MessageSquare size={16} className='inline mr-2' />
              Context *
            </label>
            <textarea
              value={formData.context}
              onChange={(e) => handleChange('context', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.context ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='Describe the followup context, purpose, and any important details...'
            />
            {errors.context && (
              <p className='mt-1 text-sm text-red-600'>{errors.context}</p>
            )}
          </div>

          {/* Followup Date & Time */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <Clock size={16} className='inline mr-2' />
              Followup Date & Time *
            </label>
            <input
              type='datetime-local'
              value={formData.followupDateTime}
              onChange={(e) => handleChange('followupDateTime', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.followupDateTime ? 'border-red-300' : 'border-gray-300'
              }`}
              min={new Date().toISOString().slice(0, 16)}
            />
            {errors.followupDateTime && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.followupDateTime}
              </p>
            )}
            <p className='mt-1 text-sm text-gray-500'>
              Select when this followup should be scheduled
            </p>
          </div>

          {/* Auto Mode Toggle */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <Calendar size={16} className='inline mr-2' />
              Followup Mode
            </label>
            <div className='flex items-center space-x-4'>
              <button
                type='button'
                onClick={() => handleChange('isAutoMode', false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  !formData.isAutoMode
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ToggleLeft size={16} />
                <span>Manual Mode</span>
              </button>
              <button
                type='button'
                onClick={() => handleChange('isAutoMode', true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  formData.isAutoMode
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ToggleRight size={16} />
                <span>Auto Mode</span>
              </button>
            </div>
            <p className='mt-2 text-sm text-gray-600'>
              {formData.isAutoMode
                ? 'Auto mode will automatically schedule and manage followups based on predefined rules.'
                : 'Manual mode requires manual scheduling and management of followups.'}
            </p>
          </div>

          {/* Status Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Form Actions */}
          <div className='flex items-center justify-end space-x-4 pt-6 border-t border-gray-200'>
            <Link
              to='/dashboard/followups'
              className='px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
            >
              Cancel
            </Link>
            <button
              type='submit'
              disabled={isLoading}
              className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isLoading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className='mr-2' />
                  {isEditing ? 'Update Followup' : 'Create Followup'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
