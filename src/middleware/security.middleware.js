import prisma from '../config/db.js';

export async function validateWidgetHandshake(req, res, next) {
  try {
    // Extract the proprietary key sent by the embeddable script layout from headers
    const apiKey = req.headers['x-widget-key'];
    const requestOrigin = req.headers.origin;

    if (!apiKey) {
      return res.status(401).json({ 
        error: 'Unauthorized access payload: X-Widget-Key header missing from initialization routing.' 
      });
    }

    // Database lookup to verify the incoming API Key exists
    const matchedSystem = await prisma.system.findUnique({
      where: { api_key: apiKey }
    });

    if (!matchedSystem) {
      return res.status(403).json({ 
        error: 'Forbidden operational intent: The provided system authorization key is invalid.' 
      });
    }

    // CORS Origin strict checking enforcement block
    if (process.env.NODE_ENV !== 'development') {
      if (!requestOrigin || requestOrigin !== matchedSystem.allowed_origin) {
        return res.status(403).json({
          error: `Cross-Origin resource rejection: Request origin does not match allowed paths for ${matchedSystem.name}.`
        });
      }
    }

    // Attach verified target context meta variables directly onto request parameters for downstream accessibility
    req.targetSystem = matchedSystem;
    next();
  } catch (error) {
    next(error); // Route unforeseen memory faults immediately to the global error pipeline
  }
}
