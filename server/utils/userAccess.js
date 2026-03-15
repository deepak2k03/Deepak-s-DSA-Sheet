const getAdminEmailSet = () =>
  new Set(
    (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );

const getRoleForEmail = (email, fallbackRole = 'user') => {
  if (!email) {
    return fallbackRole;
  }

  return getAdminEmailSet().has(email.trim().toLowerCase()) ? 'admin' : fallbackRole;
};

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  solvedProblems: user.solvedProblems || [],
  role: user.role || 'user',
  isActive: user.isActive !== false,
  emailVerified: Boolean(user.emailVerified),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

module.exports = {
  getRoleForEmail,
  sanitizeUser,
};