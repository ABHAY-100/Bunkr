export const setToken = (token: string, expiresInDays: number = 24) => {
  const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;

  const tokenData = {
    value: token,
    expiresAt,
  };

  localStorage.setItem("ezygo_access_token", JSON.stringify(tokenData));
  return;
};

export const getToken = () => {
  const tokenString = localStorage.getItem("ezygo_access_token");

  if (!tokenString) return null;

  try {
    const tokenData = JSON.parse(tokenString);

    if (Date.now() > tokenData.expiresAt) {
      localStorage.removeItem("ezygo_access_token");
      return null;
    }

    return tokenData.value;
  } catch {
    localStorage.removeItem("ezygo_access_token");
    return null;
  }
};

export const removeToken = () => {
  localStorage.removeItem("ezygo_access_token");
  return;
};
