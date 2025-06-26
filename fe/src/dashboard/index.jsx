import { useState, useEffect, useMemo } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import {
  Users,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
  UserPlus,
  Phone,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Wifi,
  WifiOff,
  X,
  Loader2,
  QrCode,
  BookOpen,
} from 'lucide-react';
import { SignedIn, UserButton } from '@clerk/clerk-react';

import { io } from 'socket.io-client';
import useCompany from '../hooks/useCompany';
import QRCode from 'react-qr-code';

// const socket = io(import.meta.env.VITE_API_URL);
// socket.on('connect', () => {
//   console.log(`Connected to server ${socket.id}`);
// });

// socket.on('whatsapp:qr', (data) => {
//   console.log('whatsapp:qr', data);
// });

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState('disconnected'); // disconnected, connecting, generating_qr, connected
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();

  const { company, setCompany, refetchCompany } = useCompany();

  const socket = useMemo(() => {
    return io(import.meta.env.VITE_API_URL);
  }, []);

  // Socket event listeners for WhatsApp
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);
    socket.on('connect', () => {
      console.log(`Connected to server ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`Disconnected from server`); // undefined
    });

    socket.on('whatsapp:ready', (data) => {
      console.log('whatsapp:ready', data);
      setWhatsappStatus('connected');
    });

    socket.on('whatsapp:status', (data) => {
      setWhatsappStatus(data.status);
      if (data.status === 'connected') {
        setQrCode(null);
        setError(null);
        // Refetch company data to get the latest isWhatsappEnabled status
        refetchCompany();
        setTimeout(() => {
          setShowWhatsAppModal(false);
        }, 2000);
      } else if (data.status === 'disconnected') {
        setQrCode(null);
        setError(null);
        // Refetch company data to get the latest isWhatsappEnabled status
        refetchCompany();
      }
    });

    socket.on('whatsapp:qr', (data) => {
      console.log('whatsapp:qr', data);
      setQrCode(data.qr);
      setWhatsappStatus('generating_qr');
      setError(null);
    });

    socket.on('whatsapp:error', (data) => {
      setError(data.message);
      setWhatsappStatus('disconnected');
    });

    return () => {
      socket.off('whatsapp:status');
      socket.off('whatsapp:qr');
      socket.off('whatsapp:error');
      socket.disconnect();
    };
  }, [socket, refetchCompany]);

  // Check current WhatsApp status when company data is available
  useEffect(() => {
    if (company?._id) {
      socket.emit('whatsapp:getStatus', { companyId: company._id });
    }
  }, [company?._id]);

  const handleWhatsAppConnect = () => {
    setShowWhatsAppModal(true);
    setWhatsappStatus('connecting');
    setQrCode(null);
    setError(null);
    console.log('connecting to whatsapp');

    // Emit connect event to backend
    socket.emit('whatsapp:connect', { companyId: company?._id });
  };

  const handleCloseModal = () => {
    setShowWhatsAppModal(false);
    setWhatsappStatus('disconnected');
    setQrCode(null);
    setError(null);

    // Emit disconnect event to backend
    socket.emit('whatsapp:disconnect', { companyId: company?._id });

    // Refetch company data to get the latest isWhatsappEnabled status
    setTimeout(() => {
      refetchCompany();
    }, 1000); // Small delay to ensure backend has processed the disconnect
  };

  const getStatusText = () => {
    switch (whatsappStatus) {
      case 'connecting':
        return 'Connecting to WhatsApp...';
      case 'generating_qr':
        return 'Generating QR Code...';
      case 'connected':
        return 'WhatsApp Connected Successfully!';
      default:
        return 'WhatsApp Disconnected';
    }
  };

  const getStatusColor = () => {
    switch (whatsappStatus) {
      case 'connecting':
      case 'generating_qr':
        return 'text-blue-600';
      case 'connected':
        return 'text-green-600';
      default:
        return 'text-red-600';
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      exact: true,
    },
    {
      name: 'Clients',
      icon: Users,
      path: '/dashboard/clients',
    },
    {
      name: 'Followups',
      icon: MessageSquare,
      path: '/dashboard/followups',
    },
    {
      name: 'Knowledge',
      icon: BookOpen,
      path: '/dashboard/knowledge',
    },
  ];

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  console.log(company);

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          {!sidebarCollapsed && (
            <div className='flex items-center space-x-2'>
              <h1 className='text-xl font-bold text-gray-800'>
                {company?.name}
              </h1>
              {/* WhatsApp Connection Indicator */}
              <div className='flex items-center space-x-1'>
                <div
                  className={`w-2 h-2 rounded-full ${
                    company?.isWhatsappEnabled
                      ? 'bg-green-500 animate-pulse'
                      : 'bg-red-500'
                  }`}
                  title={
                    company?.isWhatsappEnabled
                      ? 'WhatsApp Connected'
                      : 'WhatsApp Disconnected'
                  }
                />
                {company?.isWhatsappEnabled ? (
                  <Wifi size={12} className='text-green-500' />
                ) : (
                  <WifiOff size={12} className='text-red-500' />
                )}
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
          >
            {sidebarCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronLeft size={20} />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className='p-4'>
          <ul className='space-y-2'>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={20} className='flex-shrink-0' />
                    {!sidebarCollapsed && (
                      <span className='ml-3 font-medium'>{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* WhatsApp Connect Button */}
        {!sidebarCollapsed && (
          <div className='p-4 border-t border-gray-200'>
            <button
              onClick={handleWhatsAppConnect}
              disabled={company?.isWhatsappEnabled}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                company?.isWhatsappEnabled
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Wifi size={16} />
              <span className='font-medium'>
                {company?.isWhatsappEnabled ? 'Connected' : 'Connect WhatsApp'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Top Header */}
        <header className='bg-white shadow-sm border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className='lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors'
              >
                <Menu size={20} />
              </button>
              <div className='flex items-center space-x-3'>
                <h2 className='text-lg font-semibold text-gray-800'>
                  {menuItems.find((item) => isActive(item))?.name ||
                    'Dashboard'}
                </h2>
                {/* WhatsApp Connection Indicator for Mobile/Header */}
                <div className='flex items-center space-x-1'>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      company?.isWhatsappEnabled
                        ? 'bg-green-500 animate-pulse'
                        : 'bg-red-500'
                    }`}
                    title={
                      company?.isWhatsappEnabled
                        ? 'WhatsApp Connected'
                        : 'WhatsApp Disconnected'
                    }
                  />
                  {company?.isWhatsappEnabled ? (
                    <Wifi size={12} className='text-green-500' />
                  ) : (
                    <WifiOff size={12} className='text-red-500' />
                  )}
                </div>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              {/* WhatsApp Connect Button for Mobile */}
              <button
                onClick={handleWhatsAppConnect}
                disabled={company?.isWhatsappEnabled}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  company?.isWhatsappEnabled
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Wifi size={16} />
                <span className='hidden sm:inline font-medium'>
                  {company?.isWhatsappEnabled ? 'Connected' : 'Connect'}
                </span>
              </button>
              <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className='flex-1 overflow-auto p-6'>
          <div className='max-w-7xl mx-auto'>
            <Outlet />
          </div>
        </main>
      </div>

      {/* WhatsApp Connect Modal */}
      {showWhatsAppModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-800'>
                Connect WhatsApp
              </h3>
              <button
                onClick={handleCloseModal}
                className='p-1 rounded-lg hover:bg-gray-100 transition-colors'
              >
                <X size={20} />
              </button>
            </div>

            <div className='space-y-4'>
              {/* Status Indicator */}
              <div className='flex items-center space-x-3'>
                <div
                  className={`w-3 h-3 rounded-full ${
                    whatsappStatus === 'connected'
                      ? 'bg-green-500 animate-pulse'
                      : whatsappStatus === 'connecting' ||
                        whatsappStatus === 'generating_qr'
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-red-500'
                  }`}
                />
                <span className={`font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
                {(whatsappStatus === 'connecting' ||
                  whatsappStatus === 'generating_qr') && (
                  <Loader2 size={16} className='animate-spin text-blue-600' />
                )}
              </div>

              {/* QR Code Display */}
              {qrCode && (
                <div className='text-center'>
                  <div className='bg-gray-50 rounded-lg p-4'>
                    <QrCode size={48} className='mx-auto mb-2 text-gray-600' />
                    <p className='text-sm text-gray-600 mb-4'>
                      Scan this QR code with your WhatsApp mobile app
                    </p>
                    <div className='bg-white p-4 rounded border shadow-sm'>
                      <QRCode
                        value={qrCode}
                        size={256}
                        className='w-full h-full'
                      />
                    </div>
                    <p className='text-xs text-gray-500 mt-2'>
                      Open WhatsApp → Settings → Linked Devices → Link a Device
                    </p>
                  </div>
                </div>
              )}

              {/* Loading State for QR Generation */}
              {whatsappStatus === 'generating_qr' && !qrCode && (
                <div className='text-center'>
                  <div className='bg-gray-50 rounded-lg p-8'>
                    <Loader2
                      size={48}
                      className='mx-auto mb-4 animate-spin text-blue-600'
                    />
                    <p className='text-sm text-gray-600'>
                      Generating QR code for WhatsApp authentication...
                    </p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                  <div className='flex items-center space-x-2'>
                    <AlertCircle size={16} className='text-red-600' />
                    <span className='text-red-800 text-sm'>{error}</span>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {!qrCode && !error && whatsappStatus !== 'connected' && (
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <p className='text-blue-800 text-sm'>
                    Click connect to start the WhatsApp authentication process.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex space-x-3 pt-4'>
                <button
                  onClick={handleCloseModal}
                  className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
                >
                  Cancel
                </button>
                {whatsappStatus === 'disconnected' && (
                  <button
                    onClick={handleWhatsAppConnect}
                    className='flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
