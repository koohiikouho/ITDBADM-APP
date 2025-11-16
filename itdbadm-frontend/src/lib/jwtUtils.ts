// jwtUtils.ts
export const JWTManager = {
  getToken: (): string | null => {
    return localStorage.getItem("accessToken");
  },

  setToken: (token: string): void => {
    localStorage.setItem("accessToken", token);
  },

  removeToken: (): void => {
    localStorage.removeItem("accessToken");
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  getTokenPayload: (token: string) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  },
};
