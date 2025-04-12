export const setToken = (token: string, expiresInMinutes: number = 30) => {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

  const tokenData = {
    value: token,
    expiresAt,
  };

  sessionStorage.setItem("ezygo_access_token", JSON.stringify(tokenData));
};

export const getToken = () => {
  const tokenString = sessionStorage.getItem("ezygo_access_token");

  if (!tokenString) return null;

  try {
    const tokenData = JSON.parse(tokenString);

    if (Date.now() > tokenData.expiresAt) {
      sessionStorage.removeItem("ezygo_access_token");
      return null;
    }

    return tokenData.value;
  } catch {
    sessionStorage.removeItem("ezygo_access_token");
    return null;
  }
};

export const removeToken = () => {
  sessionStorage.removeItem("ezygo_access_token");
};
