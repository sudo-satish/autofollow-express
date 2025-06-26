import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import useCompany from '../../hooks/useCompany';
import { API_URL } from '../../config';
import toast from 'react-hot-toast';

export default function Knowledge() {
  const [searchTerm, setSearchTerm] = useState('');
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { getToken, orgId } = useAuth();

  const { company, setCompany, loading: companyLoading } = useCompany();

  useEffect(() => {
    const fetchKnowledge = async () => {
      if (!company?._id) return;

      try {
        setLoading(true);
        const token = await getToken();
        const response = await fetch(
          `${API_URL}/company/${company._id}/knowledge`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch knowledge entries');
        }

        const data = await response.json();
        setKnowledge(data.data || []);
      } catch (error) {
        console.error('Error fetching knowledge:', error);
        toast.error('Failed to fetch knowledge entries');
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledge();
  }, [company?._id, getToken]);

  const handleDelete = async (knowledgeId) => {
    if (!confirm('Are you sure you want to delete this knowledge entry?')) {
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(
        `${API_URL}/company/${company._id}/knowledge/${knowledgeId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Knowledge entry deleted successfully');
        // Refresh the list
        setKnowledge(knowledge.filter((k) => k._id !== knowledgeId));
      } else {
        throw new Error('Failed to delete knowledge entry');
      }
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      toast.error('Failed to delete knowledge entry');
    }
  };

  const filteredKnowledge = knowledge.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (companyLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Knowledge Base</h1>
          <p className='text-gray-600 mt-1'>
            Manage your company's knowledge base and documentation
          </p>
        </div>
        <Link
          to='/dashboard/knowledge/new'
          className='mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
        >
          <Plus size={16} className='mr-2' />
          Add Knowledge
        </Link>
      </div>

      {/* Search and Filters */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <Search
                size={16}
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              />
              <input
                type='text'
                placeholder='Search knowledge entries...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        </div>
      ) : filteredKnowledge.length === 0 ? (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
          <BookOpen size={48} className='mx-auto text-gray-400 mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No knowledge entries found
          </h3>
          <p className='text-gray-600 mb-4'>
            {searchTerm
              ? 'No entries match your search criteria.'
              : 'Get started by adding your first knowledge entry.'}
          </p>
          {!searchTerm && (
            <Link
              to='/dashboard/knowledge/new'
              className='inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              <Plus size={16} className='mr-2' />
              Add Knowledge
            </Link>
          )}
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Title
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Content Preview
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Created
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
                {filteredKnowledge.map((item) => (
                  <tr key={item._id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <FileText size={16} className='text-gray-400 mr-3' />
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {item.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='text-sm text-gray-900 max-w-xs truncate'>
                        {item.content}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <div className='flex items-center'>
                        <Calendar size={14} className='mr-1' />
                        {formatDate(item.createdAt)}
                      </div>
                      <div className='flex items-center text-xs text-gray-400'>
                        <Clock size={12} className='mr-1' />
                        {formatTime(item.createdAt)}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <div className='flex items-center'>
                        <Calendar size={14} className='mr-1' />
                        {formatDate(item.updatedAt)}
                      </div>
                      <div className='flex items-center text-xs text-gray-400'>
                        <Clock size={12} className='mr-1' />
                        {formatTime(item.updatedAt)}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex items-center justify-end space-x-2'>
                        <Link
                          to={`/dashboard/knowledge/${item._id}`}
                          className='text-blue-600 hover:text-blue-900 p-1'
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/dashboard/knowledge/${item._id}/edit`}
                          className='text-green-600 hover:text-green-900 p-1'
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          className='text-red-600 hover:text-red-900 p-1'
                          onClick={() => handleDelete(item._id)}
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
        </div>
      )}
    </div>
  );
}
