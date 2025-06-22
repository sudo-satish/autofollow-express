import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Phone,
  Building2,
  Globe,
} from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { API_URL } from '../../config';

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [clients, setClients] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useUser();
  const { getToken, orgId } = useAuth();

  console.log(user, orgId);

  // Fetch company details using orgId
  useEffect(() => {
    const fetchCompany = async () => {
      if (!orgId) return;

      try {
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
          console.log('Company details:', data.data);
        } else {
          setError(data.message || 'Failed to fetch company details');
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        setError(err.message);
      }
    };

    fetchCompany();
  }, [orgId, getToken]);

  // Fetch clients for the company
  useEffect(() => {
    const fetchClients = async () => {
      if (!company) return;

      try {
        setLoading(true);
        const token = await getToken();
        const response = await fetch(
          `${API_URL}/company/${company._id}/clients`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }

        const data = await response.json();
        if (data.success) {
          setClients(data.data || []);
        } else {
          setError(data.message || 'Failed to fetch clients');
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [company, getToken]);

  const handleDelete = async (clientId) => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${API_URL}/company/${company._id}/clients/${clientId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to delete client');
      }
      setClients(clients.filter((client) => client._id !== clientId));
    } catch (err) {
      console.error('Error deleting client:', err);
      setError(err.message);
    }
  };

  // Mock data - replace with actual API calls
  const mockClients = [
    {
      id: 1,
      name: 'John Smith',
      countryCode: '+1',
      phone: '555-0123',
      companyId: 'comp_001',
      companyName: 'TechCorp Solutions',
      status: 'active',
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      countryCode: '+44',
      phone: '20-7946-0958',
      companyId: 'comp_002',
      companyName: 'Global Innovations',
      status: 'active',
      createdAt: '2024-01-20',
    },
    {
      id: 3,
      name: 'Mike Wilson',
      countryCode: '+1',
      phone: '555-0456',
      companyId: 'comp_003',
      companyName: 'StartupXYZ',
      status: 'inactive',
      createdAt: '2024-01-25',
    },
    {
      id: 4,
      name: 'Emily Davis',
      countryCode: '+49',
      phone: '30-12345678',
      companyId: 'comp_004',
      companyName: 'EuroTech GmbH',
      status: 'active',
      createdAt: '2024-02-01',
    },
  ];

  // Use mock data for now until API is ready
  const displayClients = clients.length > 0 ? clients : mockClients;

  const filteredClients = displayClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.companyName &&
        client.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      selectedStatus === 'all' || client.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='space-y-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-center'>
            <div className='text-red-400 mr-2'>⚠️</div>
            <span className='text-red-800'>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Clients</h1>
          <p className='text-gray-600'>
            Manage your client profiles and information
            {company && (
              <span className='ml-2 text-blue-600'>• {company.name}</span>
            )}
          </p>
        </div>
        <Link
          to='/dashboard/clients/new'
          className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          <Plus size={20} className='mr-2' />
          Add Client
        </Link>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='p-3 bg-blue-100 rounded-lg'>
              <Users className='text-blue-600' size={24} />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Total Clients</p>
              <p className='text-2xl font-bold text-gray-900'>
                {displayClients.length}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='p-3 bg-green-100 rounded-lg'>
              <Users className='text-green-600' size={24} />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>
                Active Clients
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {displayClients.filter((c) => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center'>
            <div className='p-3 bg-purple-100 rounded-lg'>
              <Building2 className='text-purple-600' size={24} />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>Company</p>
              <p className='text-2xl font-bold text-gray-900'>
                {company ? company.name : 'Loading...'}
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
                placeholder='Search clients by name, phone, or company...'
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
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Client
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Contact
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Company
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Created
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredClients.map((client) => (
                <tr key={client._id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                        <span className='text-blue-600 font-medium'>
                          {client.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {client.name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          ID: {client._id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <Phone size={16} className='text-gray-400 mr-2' />
                      <span className='text-sm text-gray-900'>
                        {client.countryCode} {client.phone}
                      </span>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <Building2 size={16} className='text-gray-400 mr-2' />
                      <span className='text-sm text-gray-900'>
                        {client.companyName || (company ? company.name : 'N/A')}
                      </span>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        client.status
                      )}`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <div className='flex items-center justify-end space-x-2'>
                      <Link
                        to={`/dashboard/clients/${client.id}`}
                        className='text-blue-600 hover:text-blue-900 p-1'
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/dashboard/clients/${client.id}/edit`}
                        className='text-green-600 hover:text-green-900 p-1'
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        className='text-red-600 hover:text-red-900 p-1'
                        onClick={() => handleDelete(client._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className='text-center py-12'>
            <Users size={48} className='mx-auto text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No clients found
            </h3>
            <p className='text-gray-600 mb-4'>
              {searchTerm || selectedStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first client'}
            </p>
            {!searchTerm && selectedStatus === 'all' && (
              <Link
                to='/dashboard/clients/new'
                className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Plus size={20} className='mr-2' />
                Add Client
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
