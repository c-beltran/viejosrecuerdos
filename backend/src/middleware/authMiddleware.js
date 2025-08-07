const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabaseClient');

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

async function verifySupabaseToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub;

    // Fetch user profile (role)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, name')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    req.user = {
      id: userId,
      email: decoded.email,
      role: profile?.role || 'clerk',
      name: profile?.name || 'User',
    };

    next();
  } catch (err) {
    console.error('[AUTH ERROR]', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { verifySupabaseToken };

