/**
 * middleware/security.js — Advanced Security Middleware
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://fonts.googleapis.com", "https://unpkg.com"],
      connectSrc: ["'self'", "https://axx-spaces-backend-1.onrender.com", "wss://axx-spaces-backend-1.onrender.com", "https://*.tile.openstreetmap.org"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.FRONTEND_URL || "https://axx-spaces.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

function applyTo(app) {
  app.use(cookieParser());
  app.use(helmetConfig);
  app.use(cors(corsOptions));
  app.use(generalLimiter);
  app.use(mongoSanitize());
  app.use(xss());
  app.use(hpp());

  console.log("🔒 [security.js] All security middleware applied successfully");
}

export default {
  applyTo,
  generalLimiter,
  authLimiter,
};
