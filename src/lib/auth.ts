export const setToken = (token: string) => {
  localStorage.setItem('ezygo_access_token', token);
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ezygo_access_token');
    return token;
  }
  return null;
};

export const removeToken = () => {
  localStorage.removeItem('ezygo_access_token');
};
