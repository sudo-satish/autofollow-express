import { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  X,
  User,
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router';
import { API_URL } from '../../config';

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
  });

  const { getToken } = useAuth();

  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      const token = await getToken();
      const response = await fetch(`${API_URL}/company`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCompanies(data.data);
      } else {
        console.log(data.error);
      }
    };
    fetchCompanies();
  }, []);

  const stats = [
    {
      title: 'Total Companies',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Building2,
    },
    {
      title: 'Active Companies',
      value: '1,089',
      change: '+8%',
      changeType: 'positive',
      icon: Users,
    },
    {
      title: 'Revenue Growth',
      value: '$2.4M',
      change: '+23%',
      changeType: 'positive',
      icon: TrendingUp,
    },
  ];

  const getStatusColor = (status) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/company/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        // Add the new company to the list
        setCompanies([data.company, ...companies]);

        // Reset form and close modal
        setFormData({
          name: '',
          location: '',
        });
        setShowCreateForm(false);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
    });
    setShowCreateForm(false);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Companies</h1>
          <p className='text-gray-600'>Manage and monitor your company data</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors'
        >
          <Plus size={20} />
          <span>Add Company</span>
        </button>
      </div>

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
          <h2 className='text-lg font-semibold text-gray-900'>Company List</h2>
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <Search
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={20}
              />
              <input
                type='text'
                placeholder='Search companies...'
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
                  Company
                </th>
                <th className='text-left py-3 px-4 font-medium text-gray-900'>
                  Location
                </th>
                <th className='text-right py-3 px-4 font-medium text-gray-900'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr
                  key={company.id}
                  className='border-b border-gray-100 hover:bg-gray-50'
                >
                  <td className='py-4 px-4'>
                    <div>
                      <p className='font-medium text-gray-900'>
                        {company.name}
                      </p>
                    </div>
                  </td>
                  <td className='py-4 px-4 text-gray-600'>
                    {company.location}
                  </td>
                  <td className='py-4 px-4 text-right'>
                    <div className='flex items-center justify-end space-x-2'>
                      <Link
                        className='p-1 hover:bg-gray-100 rounded transition-colors flex items-center space-x-2'
                        to={`/admin/companies/${company._id}/users`}
                      >
                        <User size={16} className='text-gray-600' /> Users
                      </Link>
                      <Link
                        to={`/admin/companies/${company._id}/edit`}
                        className='p-1 hover:bg-gray-100 rounded transition-colors'
                      >
                        <Edit size={16} className='text-gray-600' />
                      </Link>
                      <button className='p-1 hover:bg-gray-100 rounded transition-colors'>
                        <Trash2 size={16} className='text-gray-600' />
                      </button>
                      <button className='p-1 hover:bg-gray-100 rounded transition-colors'>
                        <MoreVertical size={16} className='text-gray-600' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Company Modal */}
      {showCreateForm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-md mx-4'>
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <h2 className='text-xl font-semibold text-gray-900'>
                Create New Company
              </h2>
              <button
                onClick={resetForm}
                className='text-gray-400 hover:text-gray-600 transition-colors'
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='p-6 space-y-4'>
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Company Name *
                </label>
                <input
                  type='text'
                  id='name'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Enter company name'
                />
              </div>

              <div>
                <label
                  htmlFor='location'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Location *
                </label>
                <input
                  type='text'
                  id='location'
                  name='location'
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='City, State'
                />
              </div>

              <div className='flex items-center justify-end space-x-3 pt-4'>
                <button
                  type='button'
                  onClick={resetForm}
                  className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
