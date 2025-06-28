import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignInButton,
  useAuth,
  UserButton,
  useUser,
} from '@clerk/clerk-react';
import './App.css';
import { Link } from 'react-router';

function App() {
  const [count, setCount] = useState(0);

  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken, orgRole, orgId } = useAuth();

  console.log(orgRole, orgId, user);

  console.log(user?.publicMetadata);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <SignIn />;
  }

  const callProtectedRoute = async () => {
    const token = await getToken();
    console.log(token);

    const response = await fetch('http://localhost:3000/api/protected', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log(data);
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <header>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>

        <div className='flex space-x-4 mt-4'>
          {user?.publicMetadata?.role === 'super_admin' ? (
            <Link
              to='/admin'
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
            >
              Admin Dashboard
            </Link>
          ) : (
            <Link
              to='/dashboard'
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
            >
              Dashboard
            </Link>
          )}
          <Link
            to='/playground'
            className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700'
          >
            AI Playground
          </Link>
        </div>
      </header>
    </div>
  );
}

export default App;
