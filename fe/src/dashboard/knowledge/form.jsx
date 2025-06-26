import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, Save, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { API_URL } from '../../config';
import useCompany from '../../hooks/useCompany';
import toast from 'react-hot-toast';

export default function KnowledgeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { getToken, orgId } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { company, setCompany, loading: companyLoading } = useCompany();

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

        if (response.ok) {
          const data = await response.json();
          setCompany(data.data);
        } else {
          console.error('Failed to fetch company');
        }
      } catch (error) {
        console.error('Error fetching company:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchCompany();
  }, [orgId, getToken, setCompany]);

  // Fetch knowledge entry if editing
  useEffect(() => {
    const fetchKnowledge = async () => {
      if (!isEditing || !company?._id) return;

      try {
        setLoadingData(true);
        const token = await getToken();
        const response = await fetch(
          `${API_URL}/company/${company._id}/knowledge/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setFormData({
            title: data.data.title,
            content: data.data.content,
          });
        } else {
          toast.error('Failed to fetch knowledge entry');
          navigate('/dashboard/knowledge');
        }
      } catch (error) {
        console.error('Error fetching knowledge:', error);
        toast.error('Failed to fetch knowledge entry');
        navigate('/dashboard/knowledge');
      } finally {
        setLoadingData(false);
      }
    };

    fetchKnowledge();
  }, [isEditing, company?._id, id, getToken, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
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
        ? `${API_URL}/company/${company._id}/knowledge/${id}`
        : `${API_URL}/company/${company._id}/knowledge`;

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
        throw new Error(errorData.message || 'Failed to save knowledge entry');
      }

      const data = await response.json();
      if (data.success) {
        toast.success(
          isEditing
            ? 'Knowledge entry updated successfully'
            : 'Knowledge entry created successfully'
        );
        navigate('/dashboard/knowledge');
      } else {
        setErrors({ submit: data.message || 'Failed to save knowledge entry' });
      }
    } catch (error) {
      console.error('Error saving knowledge:', error);
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

  if (companyLoading || loadingData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-4'>
          <Link
            to='/dashboard/knowledge'
            className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              {isEditing ? 'Edit Knowledge Entry' : 'Add Knowledge Entry'}
            </h1>
            <p className='text-gray-600 mt-1'>
              {isEditing
                ? 'Update the knowledge entry details below.'
                : 'Create a new knowledge entry for your company.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Title Field */}
          <div>
            <label
              htmlFor='title'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Title
            </label>
            <div className='relative'>
              <FileText
                size={16}
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              />
              <input
                type='text'
                id='title'
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder='Enter knowledge entry title'
              />
            </div>
            {errors.title && (
              <p className='mt-1 text-sm text-red-600 flex items-center'>
                <AlertCircle size={14} className='mr-1' />
                {errors.title}
              </p>
            )}
          </div>

          {/* Content Field */}
          <div>
            <label
              htmlFor='content'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Content
            </label>
            <div className='relative'>
              <BookOpen
                size={16}
                className='absolute left-3 top-3 text-gray-400'
              />
              <textarea
                id='content'
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={12}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.content ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder='Enter knowledge content...'
              />
            </div>
            {errors.content && (
              <p className='mt-1 text-sm text-red-600 flex items-center'>
                <AlertCircle size={14} className='mr-1' />
                {errors.content}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
              <p className='text-sm text-red-600 flex items-center'>
                <AlertCircle size={16} className='mr-2' />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className='flex items-center justify-end space-x-4 pt-6 border-t border-gray-200'>
            <Link
              to='/dashboard/knowledge'
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              Cancel
            </Link>
            <button
              type='submit'
              disabled={isLoading}
              className='inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {isLoading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className='mr-2' />
                  {isEditing ? 'Update' : 'Create'} Knowledge Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
