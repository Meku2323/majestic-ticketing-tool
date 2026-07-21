import jwt from 'jsonwebtoken';

export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  const lang = req.headers['accept-language'] === 'am' ? 'am' : 'en';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: lang === 'am' ? 'ያልተፈቀደ መዳረሻ፡ እባክዎ አስቀድመው ይግቡ።' : 'Access Denied: Missing authorization context token credentials.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const verifiedPayload = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_2026_ticketing');
    
    // Bind current user metadata globally across downstream pipeline environments
    req.user = verifiedPayload;
    next();
  } catch (error) {
    return res.status(403).json({
      error: lang === 'am' ? 'የመዳረሻ ፈቃድዎ ጊዜ አልፎበታል ወይም ልክ ያልሆነ ነው።' : 'Session Expired or Invalid Identity Token verification signature.'
    });
  }
}
