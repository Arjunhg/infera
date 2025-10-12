export interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnvironment(): EnvValidationResult {
  const required = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CONVEX_URL',
    'ARCJET_KEY'
  ];

  const optional = [
    'N8N_URL_ENDPOINT',
    'IMAGEKIT_URL_PUBLIC_KEY', 
    'IMAGEKIT_URL_PRIVATE_KEY',
    'IMAGEKIT_URL_ENDPOINT',
    'AKOOL_API_TOKEN',
    'AKOOL_CLIENT_ID',
    'AKOOL_SEC_ID'
  ];

  const missing = required.filter(key => !process.env[key]);
  const warnings = optional.filter(key => !process.env[key]);

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}

export function logEnvironmentStatus(): void {
  const result = validateEnvironment();
  
  if (result.isValid) {
    console.log('✅ All required environment variables are configured');
  } else {
    console.error('❌ Missing required environment variables:', result.missing);
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ Optional environment variables not configured:', result.warnings);
    console.warn('⚠️ Some features may use fallback functionality');
  }

  // Specific n8n warning
  if (!process.env.N8N_URL_ENDPOINT) {
    console.warn('⚠️ N8N_URL_ENDPOINT not configured - using fallback interview questions');
  }
}