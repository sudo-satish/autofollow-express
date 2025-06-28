import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { Settings, X, Save, Edit3 } from 'lucide-react';

const Playground = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [context, setContext] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [originalSystemPrompt, setOriginalSystemPrompt] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { getToken } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      setSystemPrompt(selectedAgent.systemPrompt);
      setOriginalSystemPrompt(selectedAgent.systemPrompt);
      setContext('');
    }
  }, [selectedAgent]);

  const fetchAgents = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        'http://localhost:3000/api/playground/agents',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAgents(data.data);
        if (data.data.length > 0) {
          setSelectedAgent(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to fetch agents');
    }
  };

  const updateAgent = async () => {
    if (!selectedAgent) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `http://localhost:3000/api/agent/${selectedAgent._id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: selectedAgent.name,
            systemPrompt: systemPrompt,
            description: selectedAgent.description,
            isActive: selectedAgent.isActive,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedAgent(data.data);
        setOriginalSystemPrompt(systemPrompt);
        setIsEditing(false);
        toast.success('Agent updated successfully');

        // Update the agent in the agents list
        setAgents(
          agents.map((agent) =>
            agent._id === selectedAgent._id ? data.data : agent
          )
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update agent');
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error('Failed to update agent');
    }
  };

  const handleSave = () => {
    updateAgent();
  };

  const handleCancel = () => {
    setSystemPrompt(originalSystemPrompt);
    setIsEditing(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = await getToken();
      const response = await fetch(
        'http://localhost:3000/api/playground/chat',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: updatedMessages,
            agentId: selectedAgent?._id,
            context: context.trim() || undefined,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data.conversation);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to send message');
        // Remove the user message if the request failed
        setMessages(messages);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Remove the user message if the request failed
      setMessages(messages);
    } finally {
      setIsLoading(false);
      // Keep input focused after sending message
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      {showSidebar && (
        <div className='w-96 bg-white border-r border-gray-200 flex flex-col'>
          {/* Sidebar Header */}
          <div className='p-4 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Agent Settings
              </h2>
              <button
                onClick={() => setShowSidebar(false)}
                className='p-1 hover:bg-gray-100 rounded transition-colors'
              >
                <X size={20} className='text-gray-600' />
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className='flex-1 overflow-y-auto p-4 space-y-6'>
            {/* Agent Info */}
            <div>
              <h3 className='text-sm font-medium text-gray-900 mb-2'>
                Selected Agent
              </h3>
              <div className='bg-gray-50 p-3 rounded-lg'>
                <p className='font-medium text-gray-900'>
                  {selectedAgent?.name}
                </p>
                {selectedAgent?.description && (
                  <p className='text-sm text-gray-600 mt-1'>
                    {selectedAgent.description}
                  </p>
                )}
              </div>
            </div>

            {/* Context */}
            <div>
              <h3 className='text-sm font-medium text-gray-900 mb-2'>
                Context
              </h3>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder='Enter context for this conversation...'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500'
                rows={4}
              />
              <p className='text-xs text-gray-500 mt-1'>
                This context will be used to provide additional information to
                the agent
              </p>
            </div>

            {/* System Prompt */}
            <div>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-sm font-medium text-gray-900'>
                  System Prompt
                </h3>
                <div className='flex items-center space-x-2'>
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className='p-1 hover:bg-green-100 rounded transition-colors'
                        title='Save changes'
                      >
                        <Save size={16} className='text-green-600' />
                      </button>
                      <button
                        onClick={handleCancel}
                        className='p-1 hover:bg-red-100 rounded transition-colors'
                        title='Cancel changes'
                      >
                        <X size={16} className='text-red-600' />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className='p-1 hover:bg-gray-100 rounded transition-colors'
                      title='Edit system prompt'
                    >
                      <Edit3 size={16} className='text-gray-600' />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                disabled={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isEditing
                    ? 'border-gray-300'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
                rows={8}
              />
              {isEditing && (
                <p className='text-xs text-gray-500 mt-1'>
                  Edit the system prompt to change how this agent behaves
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className='flex-1 flex flex-col'>
        {/* Header */}
        <div className='bg-white border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                AI Agent Playground
              </h1>
              <p className='text-sm text-gray-600'>
                Develop and test your AI agents
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <select
                value={selectedAgent?._id || ''}
                onChange={(e) => {
                  const agent = agents.find((a) => a._id === e.target.value);
                  setSelectedAgent(agent);
                }}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className='p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors'
                title='Toggle settings sidebar'
              >
                <Settings size={20} />
              </button>
              <button
                onClick={clearChat}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className='flex-1 overflow-y-auto p-6 space-y-4'>
          {messages.length === 0 ? (
            <div className='flex items-center justify-center h-full'>
              <div className='text-center'>
                <div className='text-6xl mb-4'>🤖</div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  Start a conversation
                </h3>
                <p className='text-gray-600'>
                  Begin chatting with your AI agent to test its capabilities
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <div className='whitespace-pre-wrap'>{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className='flex justify-start'>
              <div className='bg-white border border-gray-200 text-gray-900 px-4 py-2 rounded-lg'>
                <div className='flex items-center space-x-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900'></div>
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className='bg-white border-t border-gray-200 p-6'>
          <div className='flex space-x-4'>
            <div className='flex-1'>
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isLoading
                    ? 'AI is responding... You can continue typing'
                    : 'Type your message here...'
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                rows='3'
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className='px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
          <div className='mt-2 text-xs text-gray-500'>
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;
