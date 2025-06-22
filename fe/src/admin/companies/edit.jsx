import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '@clerk/clerk-react';
import { API_URL } from '../../config';
import { ArrowLeft, Save, X, Check } from 'lucide-react';

export default function EditCompany() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [company, setCompany] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    agents: [],
  });

  // Fetch company and agents data
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      // Fetch company
      const companyResponse = await fetch(`${API_URL}/company/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!companyResponse.ok) {
        throw new Error('Failed to fetch company');
      }

      const companyResult = await companyResponse.json();
      setCompany(companyResult.data);

      // Handle agents array - convert to array of IDs
      const agentIds = companyResult.data.agents
        ? companyResult.data.agents.map((agent) =>
            typeof agent === 'object' ? agent._id : agent
          )
        : [];

      console.log('Company data:', companyResult.data);
      console.log('Agent IDs:', agentIds);

      setFormData({
        name: companyResult.data.name,
        location: companyResult.data.location,
        agents: agentIds,
      });

      // Fetch agents
      const agentsResponse = await fetch(`${API_URL}/agent`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!agentsResponse.ok) {
        throw new Error('Failed to fetch agents');
      }

      const agentsResult = await agentsResponse.json();
      setAgents(agentsResult.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  // Handle agent selection
  const handleAgentToggle = (agentId) => {
    setFormData((prev) => ({
      ...prev,
      agents: prev.agents.includes(agentId)
        ? prev.agents.filter((id) => id !== agentId)
        : [...prev.agents, agentId],
    }));
  };

  // Save company
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = await getToken();
      const response = await fetch(`${API_URL}/company/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update company');
      }

      const result = await response.json();
      setCompany(result.data);
      navigate('/admin/companies');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  // Debug: Log form data changes
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Company Not Found
          </h2>
          <p className='text-gray-600 mb-4'>
            The company you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/admin/companies')}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-4'>
          <button
            onClick={() => navigate('/admin/companies')}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <ArrowLeft size={20} className='text-gray-600' />
          </button>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Edit Company</h1>
            <p className='text-gray-600'>
              Update company information and agent access
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
          {error}
        </div>
      )}

      {/* Edit Form */}
      <div className='bg-white rounded-lg shadow-md p-6'>
        <form onSubmit={handleSave} className='space-y-6'>
          {/* Basic Information */}
          <div>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Basic Information
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Company Name *
                </label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Enter company name'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Location *
                </label>
                <input
                  type='text'
                  name='location'
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='City, State'
                />
              </div>
            </div>
          </div>

          {/* Agent Access */}
          <div>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Agent Access
            </h2>
            <p className='text-sm text-gray-600 mb-4'>
              Select which agents should have access to this company
            </p>

            {agents.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                <p>No agents available. Create some agents first.</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {agents.map((agent) => {
                  const isSelected = formData.agents.includes(agent._id);
                  return (
                    <div
                      key={agent._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleAgentToggle(agent._id)}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <h3 className='font-medium text-gray-900'>
                            {agent.name}
                          </h3>
                          {agent.description && (
                            <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                              {agent.description}
                            </p>
                          )}
                          <div className='flex items-center mt-2'>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                agent.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {agent.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {isSelected && (
                              <span className='ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'>
                                Selected
                              </span>
                            )}
                          </div>
                        </div>
                        <div className='ml-3'>
                          {isSelected ? (
                            <div className='w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center'>
                              <Check size={16} className='text-white' />
                            </div>
                          ) : (
                            <div className='w-6 h-6 border-2 border-gray-300 rounded-full'></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {formData.agents.length > 0 && (
              <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
                <p className='text-sm text-blue-800'>
                  <strong>{formData.agents.length}</strong> agent
                  {formData.agents.length !== 1 ? 's' : ''} selected
                </p>
                <div className='mt-2 text-xs text-blue-600'>
                  Selected:{' '}
                  {formData.agents
                    .map((agentId) => {
                      const agent = agents.find((a) => a._id === agentId);
                      return agent ? agent.name : agentId;
                    })
                    .join(', ')}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className='flex items-center justify-end space-x-4 pt-6 border-t border-gray-200'>
            <button
              type='button'
              onClick={() => navigate('/admin/companies')}
              className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2'
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button
              type='submit'
              disabled={saving}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2'
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
