import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Building2,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { API_URL } from '../../config';

export default function ClientForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { getToken, orgId } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    countryCode: '+91',
    phone: '',
    companyId: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  // Fetch company details using orgId
  useEffect(() => {
    const fetchCompany = async () => {
      if (!orgId) return;

      try {
        setLoadingCompany(true);
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
        } else {
          setErrors({
            submit: data.message || 'Failed to fetch company details',
          });
        }
      } catch (err) {
        console.error('Error fetching company:', err);
        setErrors({ submit: err.message });
      } finally {
        setLoadingCompany(false);
      }
    };

    fetchCompany();
  }, [orgId, getToken]);

  // Load client data if editing
  useEffect(() => {
    const fetchClient = async () => {
      if (isEditing && company && id) {
        try {
          setIsLoading(true);
          const token = await getToken();
          const response = await fetch(
            `${API_URL}/company/${company._id}/clients/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to fetch client details');
          }

          const data = await response.json();
          if (data.success) {
            const client = data.data;
            setFormData({
              name: client.name,
              countryCode: client.countryCode,
              phone: client.phone,
              companyId: client.companyId,
              status: client.status,
            });
          } else {
            setErrors({
              submit: data.message || 'Failed to fetch client details',
            });
          }
        } catch (err) {
          console.error('Error fetching client:', err);
          setErrors({ submit: err.message });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchClient();
  }, [isEditing, company, id, getToken]);

  const countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+65', country: 'Singapore' },
    { code: '+60', country: 'Malaysia' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number contains invalid characters';
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Company is required';
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
        ? `${API_URL}/company/${company._id}/clients/${id}`
        : `${API_URL}/company/${company._id}/clients`;

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
        throw new Error(errorData.message || 'Failed to save client');
      }

      const data = await response.json();
      if (data.success) {
        navigate('/dashboard/clients');
      } else {
        setErrors({ submit: data.message || 'Failed to save client' });
      }
    } catch (error) {
      console.error('Error saving client:', error);
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

  if (loadingCompany) {
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
            to='/dashboard/clients'
            className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              {isEditing ? 'Edit Client' : 'Add New Client'}
            </h1>
            <p className='text-gray-600'>
              {isEditing
                ? 'Update client information'
                : 'Create a new client profile'}
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

          {/* Name Field */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              <User size={16} className='inline mr-2' />
              Full Name *
            </label>
            <input
              type='text'
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder='Enter client full name'
            />
            {errors.name && (
              <p className='mt-1 text-sm text-red-600'>{errors.name}</p>
            )}
          </div>

          {/* Phone Number Fields */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <Globe size={16} className='inline mr-2' />
                Country Code *
              </label>
              <select
                value={formData.countryCode}
                onChange={(e) => handleChange('countryCode', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code} ({country.country})
                  </option>
                ))}
              </select>
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <Phone size={16} className='inline mr-2' />
                Phone Number *
              </label>
              <input
                type='tel'
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder='Enter phone number'
              />
              {errors.phone && (
                <p className='mt-1 text-sm text-red-600'>{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Status Field */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Status *
            </label>
            <select
              value={formData.status || 'active'}
              onChange={(e) => handleChange('status', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value='active'>Active</option>
              <option value='inactive'>Inactive</option>
              <option value='pending'>Pending</option>
            </select>
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
              Client will be associated with {company.name}
            </p>
          </div>

          {/* Form Actions */}
          <div className='flex items-center justify-end space-x-4 pt-6 border-t border-gray-200'>
            <Link
              to='/dashboard/clients'
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
                  {isEditing ? 'Update Client' : 'Create Client'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
