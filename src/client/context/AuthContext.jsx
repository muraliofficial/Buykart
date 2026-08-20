import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem('buykart_customer');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [rider, setRider] = useState(() => {
    try {
      const saved = localStorage.getItem('buykart_rider');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState(() => {
    return localStorage.getItem('buykart_admin_token') || '';
  });

  const [customerToken, setCustomerToken] = useState(() => {
    return localStorage.getItem('buykart_customer_token') || '';
  });

  const [riderToken, setRiderToken] = useState(() => {
    return localStorage.getItem('buykart_rider_token') || '';
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const url = config.url || '';
        if (url.includes('/admin')) {
          const token = localStorage.getItem('buykart_admin_token');
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        } else if (url.includes('/ontime') || url.includes('/rider')) {
          const token = localStorage.getItem('buykart_rider_token');
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        } else {
          const token = localStorage.getItem('buykart_customer_token');
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/admin/login', { username, password });
      const user = response.data.user;
      const userToken = response.data.token || '';
      setCurrentUser(user);
      if (userToken) {
        setAdminToken(userToken);
        localStorage.setItem('buykart_admin_token', userToken);
      }
      localStorage.setItem('currentUser', JSON.stringify(user));
      setLoading(false);
      return { success: true, message: response.data.message || 'Login successful' };
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await axios.post('/admin/addUser', userData);
      setLoading(false);
      return { success: true, message: response.data.message || 'User registered successfully!' };
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Registration failed.';
      return { success: false, message: msg };
    }
  };

  const loginCustomer = (customerData, custToken = '') => {
    setCustomer(customerData);
    if (custToken) {
      setCustomerToken(custToken);
      localStorage.setItem('buykart_customer_token', custToken);
    }
    localStorage.setItem('buykart_customer', JSON.stringify(customerData));
  };

  const logoutCustomer = () => {
    setCustomer(null);
    setCustomerToken('');
    localStorage.removeItem('buykart_customer');
    localStorage.removeItem('buykart_customer_token');
  };

  const loginRider = (riderData, rToken = '') => {
    setRider(riderData);
    if (rToken) {
      setRiderToken(rToken);
      localStorage.setItem('buykart_rider_token', rToken);
    }
    localStorage.setItem('buykart_rider', JSON.stringify(riderData));
  };

  const logoutRider = () => {
    setRider(null);
    setRiderToken('');
    localStorage.removeItem('buykart_rider');
    localStorage.removeItem('buykart_rider_token');
  };

  const logout = () => {
    setCurrentUser(null);
    setAdminToken('');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('buykart_admin_token');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        customer,
        rider,
        adminToken,
        customerToken,
        riderToken,
        login,
        register,
        loginCustomer,
        logoutCustomer,
        loginRider,
        logoutRider,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
