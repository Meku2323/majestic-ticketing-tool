export function requireRole(allowedRoles) {
  return (req, res, next) => {
    const lang = req.headers['accept-language'] === 'am' ? 'am' : 'en';
    
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: lang === 'am' 
          ? 'ይህን ተግባር ለመፈጸም የሚያስችል በቂ የአስተዳዳሪ ፈቃድ የለዎትም።' 
          : 'Access Forbidden: Your operational profile lacks the required permissions level.'
      });
    }
    
    next();
  };
}
