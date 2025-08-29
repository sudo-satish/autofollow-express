import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Edit,
  Trash2,
  MessageSquare,
  Users,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  ToggleLeft,
  ToggleRight,
  Phone,
  Mail,
  MapPin,
  User,
  Briefcase,
  CalendarDays,
  FileText,
  Tag,
  Eye,
  EyeOff,
  Send,
  ChevronDown,
  ChevronUp,
  X,
  Play,
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import useCompany from '../../hooks/useCompany';
import { API_URL, SOCKET_URL } from '../../config';
import moment from 'moment';
import { io } from 'socket.io-client';

const FollowupView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { company } = useCompany();

  const [followup, setFollowup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showContextPopup, setShowContextPopup] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [startingConversation, setStartingConversation] = useState(false);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-messages-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

  // WebSocket connection for real-time messages
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('whatsapp-message', (data) => {
      console.log('Received whatsapp-message:', data);
      // Only add the message if it belongs to the current followup
      if (data.followupId === id) {
        setChatMessages((prevMessages) => [...prevMessages, data.message]);
        toast.success(`New ${data.type} message received`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      socket.off('whatsapp-message');
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    const fetchFollowup = async () => {
      if (!company?._id || !id) return;

      try {
        setLoading(true);
        const token = await getToken();
        const response = await fetch(
          `${API_URL}/company/${company._id}/followups/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch followup');
        }

        const data = await response.json();
        setFollowup(data.data);

        // Fetch chat messages
        const messagesResponse = await fetch(
          `${API_URL}/company/${company._id}/followups/${id}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setChatMessages(messagesData.data || []);
        } else {
          // If no messages exist yet, start with empty array
          setChatMessages([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowup();
  }, [company?._id, id, getToken]);

  const handleDelete = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${API_URL}/company/${company._id}/followups/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Followup deleted successfully');
        navigate('/dashboard/followups');
      } else {
        throw new Error('Failed to delete followup');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete followup');
      setError(err.message);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !followup) return;

    try {
      const token = await getToken();
      const messageData = {
        sender: 'agent',
        senderId: followup.agentId._id,
        senderModel: 'Agent',
        message: newMessage,
      };

      const response = await fetch(
        `${API_URL}/company/${company._id}/followups/${id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(messageData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChatMessages([...chatMessages, data.data]);
        setNewMessage('');
        toast.success('Message sent successfully');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleStartConversation = async () => {
    if (!followup) return;

    try {
      setStartingConversation(true);
      const token = await getToken();

      const response = await fetch(
        `${API_URL}/company/${company._id}/followups/${id}/start-conversation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Conversation started successfully');
        // Refresh the followup data to get updated status
        const updatedResponse = await fetch(
          `${API_URL}/company/${company._id}/followups/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setFollowup(data.data);
        }

        // Refresh chat messages
        const messagesResponse = await fetch(
          `${API_URL}/company/${company._id}/followups/${id}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setChatMessages(messagesData.data || []);
        }
      } else {
        throw new Error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation. Please try again.');
      setError('Failed to start conversation. Please try again.');
    } finally {
      setStartingConversation(false);
    }
  };

  const handleRestartConversation = async () => {
    if (!followup) return;

    try {
      setStartingConversation(true);
      const token = await getToken();

      const response = await fetch(
        `${API_URL}/company/${company._id}/followups/${id}/restart-conversation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Conversation restarted successfully');
        // Refresh the followup data to get updated status
        const updatedResponse = await fetch(
          `${API_URL}/company/${company._id}/followups/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setFollowup(data.data);
        }

        // Refresh chat messages
        const messagesResponse = await fetch(
          `${API_URL}/company/${company._id}/followups/${id}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setChatMessages(messagesData.data || []);
        }
      } else {
        throw new Error('Failed to restart conversation');
      }
    } catch (error) {
      console.error('Error restarting conversation:', error);
      toast.error('Failed to restart conversation. Please try again.');
      setError('Failed to restart conversation. Please try again.');
    } finally {
      setStartingConversation(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatChatTime = (date) => {
    return moment(date).format('DD/MM/YYYY HH:mma');
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading followup details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>Error</h2>
          <p className='text-gray-600 mb-4'>{error}</p>
          <Link
            to='/dashboard/followups'
            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <ArrowLeft size={16} className='mr-2' />
            Back to Followups
          </Link>
        </div>
      </div>
    );
  }

  if (!followup) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <MessageSquare className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Followup Not Found
          </h2>
          <p className='text-gray-600 mb-4'>
            The followup you're looking for doesn't exist.
          </p>
          <Link
            to='/dashboard/followups'
            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <ArrowLeft size={16} className='mr-2' />
            Back to Followups
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(followup.status);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Link
            to='/dashboard/followups'
            className='p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100'
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Followup Details
            </h1>
            <p className='text-gray-600'>
              View complete information about this followup
            </p>
          </div>
        </div>
        <div className='flex items-center space-x-3'>
          <button
            onClick={
              followup?.status === 'pending'
                ? handleStartConversation
                : followup?.status === 'in_progress'
                ? handleRestartConversation
                : null
            }
            disabled={startingConversation || followup?.status === 'completed'}
            className='inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
          >
            <Play size={16} className='mr-2' />
            {startingConversation
              ? 'Starting...'
              : followup?.status === 'pending'
              ? 'Start conversation now'
              : followup?.status === 'in_progress'
              ? 'Restart conversation'
              : 'Start conversation now'}
          </button>
          <Link
            to={`/dashboard/followups/${id}/edit`}
            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <Edit size={16} className='mr-2' />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className='inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
          >
            <Trash2 size={16} className='mr-2' />
            Delete
          </button>
        </div>
      </div>

      {/* Compact Top Section */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {/* Status */}
          <div
            className={`p-3 rounded-lg border ${getStatusColor(
              followup.status
            )}`}
          >
            <div className='flex items-center'>
              <StatusIcon size={16} className='mr-2' />
              <span className='font-medium capitalize'>
                {followup.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Schedule Date */}
          <div className='p-3 bg-blue-50 rounded-lg border border-blue-200'>
            <div className='flex items-center'>
              <CalendarDays className='text-blue-600 mr-2' size={16} />
              <div>
                <p className='text-xs text-blue-600'>Scheduled Date</p>
                <p className='font-medium text-blue-900'>
                  {formatDate(followup.followupDateTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule Time */}
          <div className='p-3 bg-green-50 rounded-lg border border-green-200'>
            <div className='flex items-center'>
              <Clock className='text-green-600 mr-2' size={16} />
              <div>
                <p className='text-xs text-green-600'>Scheduled Time</p>
                <p className='font-medium text-green-900'>
                  {formatTime(followup.followupDateTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Mode */}
          <div className='p-3 bg-purple-50 rounded-lg border border-purple-200'>
            <div className='flex items-center'>
              <Zap className='text-purple-600 mr-2' size={16} />
              <div>
                <p className='text-xs text-purple-600'>Mode</p>
                <p className='font-medium text-purple-900'>
                  {followup.isAutoMode ? 'Auto' : 'Manual'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Context Preview */}
        <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <FileText className='text-gray-600 mr-2' size={16} />
              <span className='text-sm font-medium text-gray-700'>Context</span>
            </div>
            <button
              onClick={() => setShowContextPopup(true)}
              className='text-blue-600 hover:text-blue-700 text-sm font-medium'
            >
              View Full Context
            </button>
          </div>
          <p className='text-gray-600 text-sm mt-1 overflow-hidden text-ellipsis whitespace-nowrap'>
            {followup.context}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Chat Interface */}
        <div className='lg:col-span-2'>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
            {/* Chat Header */}
            <div className='p-4 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                    <MessageSquare className='text-blue-600' size={20} />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>
                      Followup Conversation
                    </h3>
                    <p className='text-sm text-gray-500'>
                      {followup.clientId?.name} & {followup.agentId?.name}
                    </p>
                  </div>
                </div>
                <div className='text-sm text-gray-500'>
                  {formatDateTime(followup.followupDateTime)}
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className='h-96 overflow-y-auto p-4 space-y-4 chat-messages-container'>
              {chatMessages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.role === 'assistant'
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'assistant'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className='flex items-center justify-between mb-1'>
                      <span className='text-xs font-medium opacity-80'>
                        {message.role === 'assistant'
                          ? 'Agent'
                          : message?.clientId?.name}
                      </span>
                      <span className='text-xs opacity-70'>
                        {formatChatTime(new Date(message.createdAt))}
                      </span>
                    </div>
                    <pre className='text-sm whitespace-pre-wrap font-sans'>
                      {message.content}
                    </pre>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className='p-4 border-t border-gray-200'>
              <div className='flex space-x-2'>
                <input
                  type='text'
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder='Type your message...'
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                <button
                  onClick={handleSendMessage}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Client Information */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center mb-4'>
              <Users className='text-blue-600 mr-3' size={20} />
              <h2 className='text-lg font-semibold text-gray-900'>Client</h2>
            </div>
            {followup.clientId ? (
              <div className='space-y-3'>
                <div className='flex items-center'>
                  <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                    <span className='text-blue-600 font-medium text-lg'>
                      {followup.clientId.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div className='ml-3'>
                    <p className='font-medium text-gray-900'>
                      {followup.clientId.name}
                    </p>
                    <p className='text-sm text-gray-500'>Client</p>
                  </div>
                </div>
                {followup.clientId.phone && (
                  <div className='flex items-center text-sm text-gray-600'>
                    <Phone size={14} className='mr-2' />
                    {followup.clientId.phone}
                  </div>
                )}
                {followup.clientId.email && (
                  <div className='flex items-center text-sm text-gray-600'>
                    <Mail size={14} className='mr-2' />
                    {followup.clientId.email}
                  </div>
                )}
              </div>
            ) : (
              <p className='text-gray-500 text-sm'>
                Client information not available
              </p>
            )}
          </div>

          {/* Agent Information */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center mb-4'>
              <User className='text-green-600 mr-3' size={20} />
              <h2 className='text-lg font-semibold text-gray-900'>
                Assigned Agent
              </h2>
            </div>
            {followup.agentId ? (
              <div className='space-y-3'>
                <div className='flex items-center'>
                  <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                    <span className='text-green-600 font-medium text-lg'>
                      {followup.agentId.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div className='ml-3'>
                    <p className='font-medium text-gray-900'>
                      {followup.agentId.name}
                    </p>
                    <p className='text-sm text-gray-500'>Agent</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className='text-gray-500 text-sm'>
                Agent information not available
              </p>
            )}
          </div>

          {/* Company Information */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center mb-4'>
              <Building2 className='text-purple-600 mr-3' size={20} />
              <h2 className='text-lg font-semibold text-gray-900'>Company</h2>
            </div>
            {followup.companyId ? (
              <div className='space-y-3'>
                <div className='flex items-center'>
                  <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center'>
                    <span className='text-purple-600 font-medium text-lg'>
                      {followup.companyId.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div className='ml-3'>
                    <p className='font-medium text-gray-900'>
                      {followup.companyId.name}
                    </p>
                    <p className='text-sm text-gray-500'>Company</p>
                  </div>
                </div>
                {followup.companyId.location && (
                  <div className='flex items-center text-sm text-gray-600'>
                    <MapPin size={14} className='mr-2' />
                    {followup.companyId.location}
                  </div>
                )}
              </div>
            ) : (
              <p className='text-gray-500 text-sm'>
                Company information not available
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <div className='flex items-center mb-4'>
              <Tag className='text-gray-600 mr-3' size={20} />
              <h2 className='text-lg font-semibold text-gray-900'>Metadata</h2>
            </div>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Created:</span>
                <span className='text-gray-900'>
                  {formatDateTime(followup.createdAt)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Last Updated:</span>
                <span className='text-gray-900'>
                  {formatDateTime(followup.updatedAt)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>ID:</span>
                <span className='text-gray-900 font-mono text-xs'>
                  {followup._id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Popup */}
      {showContextPopup && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Followup Context
              </h3>
              <button
                onClick={() => setShowContextPopup(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X size={20} />
              </button>
            </div>
            <div className='bg-gray-50 rounded-lg p-4'>
              <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                {followup.context}
              </p>
            </div>
            <div className='mt-4 flex justify-end'>
              <button
                onClick={() => setShowContextPopup(false)}
                className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <div className='flex items-center mb-4'>
              <AlertCircle className='text-red-500 mr-3' size={24} />
              <h3 className='text-lg font-semibold text-gray-900'>
                Delete Followup
              </h3>
            </div>
            <p className='text-gray-600 mb-6'>
              Are you sure you want to delete this followup? This action cannot
              be undone.
            </p>
            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowupView;
