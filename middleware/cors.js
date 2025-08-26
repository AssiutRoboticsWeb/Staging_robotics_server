const cors = require('cors');

// Configure CORS to allow frontend access
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }

    const allowedOrigins = [
      'http://localhost:5000',
      'http://localhost:5173',
      'http://localhost:5504',
      'http://localhost:5500',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://assiut-robotics-web.vercel.app',
      'https://assiut-robotics-web-git-main-anthonygaius.vercel.app',
      'https://assiut-robotics-web-anthonygaius.vercel.app',
      'https://assiut-robotics-website-xi.vercel.app',
    ];

    console.log(`CORS: Checking origin: ${origin}`);

    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`CORS: Allowing origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`CORS: Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['Content-Length', 'Content-Type', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400, // 24 hours
};

// Development CORS options (more permissive)
const devCorsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['Content-Length', 'Content-Type', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400,
};

// Production CORS options (more permissive for troubleshooting)
const productionCorsOptions = {
  origin: true, // Allow all origins temporarily for troubleshooting
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['Content-Length', 'Content-Type', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400,
};

// Vercel-specific CORS options
const vercelCorsOptions = {
  origin: '*', // Allow all origins for Vercel
  credentials: false, // Disable credentials for Vercel
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: ['Content-Length', 'Content-Type', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400,
};

// CORS middleware function
const setupCORS = app => {
  console.log('Setting up CORS middleware...');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Platform: ${process.env.VERCEL ? 'Vercel' : 'Other'}`);

  // Use Vercel-specific CORS if on Vercel
  let currentCorsOptions;
  if (process.env.VERCEL) {
    console.log('Using Vercel-specific CORS configuration');
    currentCorsOptions = vercelCorsOptions;
  } else if (process.env.NODE_ENV === 'production') {
    console.log('Using production CORS configuration (permissive for troubleshooting)');
    currentCorsOptions = productionCorsOptions;
  } else {
    console.log('Using development CORS configuration');
    currentCorsOptions = devCorsOptions;
  }

  // Apply CORS middleware
  app.use(cors(currentCorsOptions));

  // Handle preflight requests explicitly
  app.options('*', (req, res) => {
    console.log('CORS: Handling preflight request for:', req.method, req.url);

    const origin = req.headers.origin;
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Credentials', currentCorsOptions.credentials ? 'true' : 'false');
    res.header(
      'Access-Control-Allow-Methods',
      currentCorsOptions.methods.join(', ')
    );
    res.header(
      'Access-Control-Allow-Headers',
      currentCorsOptions.allowedHeaders.join(', ')
    );
    res.header('Access-Control-Max-Age', currentCorsOptions.maxAge);
    res.status(200).end();
  });

  // Ensure CORS headers are present in all responses
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    // Log CORS-related requests
    if (req.method === 'OPTIONS' || origin) {
      console.log(
        `CORS: ${req.method} ${req.url} - Origin: ${origin || 'none'}`
      );
    }

    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Credentials', currentCorsOptions.credentials ? 'true' : 'false');
    res.header(
      'Access-Control-Allow-Methods',
      currentCorsOptions.methods.join(', ')
    );
    res.header(
      'Access-Control-Allow-Headers',
      currentCorsOptions.allowedHeaders.join(', ')
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Max-Age', currentCorsOptions.maxAge);
      res.status(200).end();
      return;
    }

    next();
  });

  console.log('CORS middleware setup complete');
};

module.exports = {
  corsOptions,
  devCorsOptions,
  productionCorsOptions,
  vercelCorsOptions,
  setupCORS,
};
