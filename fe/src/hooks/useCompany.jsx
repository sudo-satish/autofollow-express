import { useAuth } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const useCompany = () => {
  const { getToken, orgId } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgId) {
      fetchCompany(orgId);
    }
  }, [orgId]);

  const fetchCompany = async (orgId) => {
    const token = await getToken();
    const response = await fetch(`${API_URL}/company/org/${orgId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    setCompany(data.data);
    setLoading(false);
  };

  return { company, setCompany, loading };
};

export default useCompany;
