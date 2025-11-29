// middleware/authmiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

function extractToken(req) {
  // 1) Authorization header (Bearer)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  // 2) Fallback: cookie named "token"
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  // 3) Fallback: query param ?token=...
  if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}

export function protectRoute(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("FATAL: JWT_SECRET is not set");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Verify token; throws on invalid/expired token
    const decoded = jwt.verify(token, secret);

    // attach minimal user info for downstream handlers
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    return next();
  } catch (err) {
    console.error("Auth middleware error:", err?.stack ?? err);
    if (err && err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * requireRole(...roles)
 * Usage: router.get("/supplier-only", protectRoute, requireRole("supplier"), handler)
 */
export function requireRole(...allowedRoles) {
  const allowed = new Set(allowedRoles.flat());
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      if (!allowed.has(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient permissions" });
      }
      return next();
    } catch (err) {
      console.error("requireRole error:", err?.stack ?? err);
      return res.status(500).json({ message: "Server error" });
    }
  };
}
