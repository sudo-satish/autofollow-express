import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import {
  ArrowLeft,
  Edit,
  Trash2,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { API_URL } from '../../config';
import useCompany from '../../hooks/useCompany';
import toast from 'react-hot-toast';

export default function KnowledgeView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getToken, orgId } = useAuth();

  const [knowledge, setKnowledge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      }
    };

    fetchCompany();
  }, [orgId, getToken, setCompany]);

  // Fetch knowledge entry
  useEffect(() => {
    const fetchKnowledge = async () => {
      if (!company?._id) return;

      try {
        setLoading(true);
        setError(null);
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
          setKnowledge(data.data);
        } else {
          const errorData = await response.json();
          throw new Error(
            errorData.message || 'Failed to fetch knowledge entry'
          );
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Failed to fetch knowledge entry');
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledge();
  }, [company?._id, id, getToken]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this knowledge entry?')) {
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(
        `${API_URL}/company/${company._id}/knowledge/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Knowledge entry deleted successfully');
        navigate('/dashboard/knowledge');
      } else {
        throw new Error('Failed to delete knowledge entry');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete knowledge entry');
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (companyLoading || loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
          <AlertCircle size={48} className='mx-auto text-red-400 mb-4' />
          <h3 className='text-lg font-medium text-red-900 mb-2'>Error</h3>
          <p className='text-red-700 mb-4'>{error}</p>
          <Link
            to='/dashboard/knowledge'
            className='inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors'
          >
            <ArrowLeft size={16} className='mr-2' />
            Back to Knowledge Base
          </Link>
        </div>
      </div>
    );
  }

  if (!knowledge) {
    return (
      <div className='p-6'>
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center'>
          <BookOpen size={48} className='mx-auto text-yellow-400 mb-4' />
          <h3 className='text-lg font-medium text-yellow-900 mb-2'>
            Knowledge Entry Not Found
          </h3>
          <p className='text-yellow-700 mb-4'>
            The knowledge entry you're looking for doesn't exist.
          </p>
          <Link
            to='/dashboard/knowledge'
            className='inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors'
          >
            <ArrowLeft size={16} className='mr-2' />
            Back to Knowledge Base
          </Link>
        </div>
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
              Knowledge Entry
            </h1>
            <p className='text-gray-600 mt-1'>
              View and manage knowledge base content
            </p>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <Link
            to={`/dashboard/knowledge/${id}/edit`}
            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
          >
            <Edit size={16} className='mr-2' />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className='inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors'
          >
            <Trash2 size={16} className='mr-2' />
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        {/* Header Info */}
        <div className='bg-gray-50 px-6 py-4 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <FileText size={20} className='text-gray-400' />
            <h2 className='text-xl font-semibold text-gray-900'>
              {knowledge.title}
            </h2>
          </div>
          <div className='mt-3 flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm text-gray-500'>
            <div className='flex items-center'>
              <Calendar size={14} className='mr-1' />
              Created: {formatDate(knowledge.createdAt)} at{' '}
              {formatTime(knowledge.createdAt)}
            </div>
            <div className='flex items-center'>
              <Clock size={14} className='mr-1' />
              Updated: {formatDate(knowledge.updatedAt)} at{' '}
              {formatTime(knowledge.updatedAt)}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className='p-6'>
          <div className='prose max-w-none'>
            <div className='whitespace-pre-wrap text-gray-700 leading-relaxed'>
              {knowledge.content}
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className='mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <h3 className='text-sm font-medium text-gray-900 mb-3'>
          Entry Information
        </h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='text-gray-500'>Entry ID:</span>
            <span className='ml-2 font-mono text-gray-900'>
              {knowledge._id}
            </span>
          </div>
          <div>
            <span className='text-gray-500'>Company:</span>
            <span className='ml-2 text-gray-900'>
              {knowledge.companyId?.name || 'N/A'}
            </span>
          </div>
          <div>
            <span className='text-gray-500'>Created:</span>
            <span className='ml-2 text-gray-900'>
              {formatDate(knowledge.createdAt)}
            </span>
          </div>
          <div>
            <span className='text-gray-500'>Last Updated:</span>
            <span className='ml-2 text-gray-900'>
              {formatDate(knowledge.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
