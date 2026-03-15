export interface StoredUser {
  id?: string;
  username: string;
  email: string;
  solvedProblems?: string[];
  role?: 'user' | 'admin';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const AUTH_STATE_EVENT = 'auth-state-changed';

const notifyAuthStateChange = () => {
  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
};

export const getStoredToken = () => localStorage.getItem('token');

export const getStoredUser = (): StoredUser | null => {
  const rawUser = localStorage.getItem('user');

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as StoredUser;
  } catch (error) {
    console.error('Failed to parse stored user data', error);
    localStorage.removeItem('user');
    return null;
  }
};

export const setAuthSession = (token: string, user: StoredUser) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  notifyAuthStateChange();
};

export const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  notifyAuthStateChange();
};

export const updateStoredUser = (
  updater: (user: StoredUser) => StoredUser,
) => {
  const currentUser = getStoredUser();

  if (!currentUser) {
    return null;
  }

  const nextUser = updater(currentUser);
  localStorage.setItem('user', JSON.stringify(nextUser));
  notifyAuthStateChange();

  return nextUser;
};