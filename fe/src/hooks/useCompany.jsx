import { useAuth } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const useCompany = () => {
  const { getToken, orgId } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (orgId) {
      fetchCompany(orgId);
    }
  }, [orgId]);

  // Function to refetch company data
  const refetchCompany = async () => {
    if (orgId) {
      await fetchCompany(orgId);
    }
  };

  return { company, setCompany, loading, refetchCompany };
};

export default useCompany;
