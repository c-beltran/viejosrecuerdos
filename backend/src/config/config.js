const config = require('config');

// Helper function to safely get config values with defaults
const getConfig = (path, defaultValue) => {
  try {
    return config.get(path);
  } catch (error) {
    return defaultValue;
  }
};

module.exports = {
  PORT: getConfig('server.port', process.env.PORT || 8000),
  JWT_SECRET: getConfig('jwt.secret', process.env.SUPABASE_JWT_SECRET),
  DB_URL: getConfig('db.url', process.env.SUPABASE_DB_URL || 'postgres://username:password@localhost:5432/viejosrecuerdos'),
  AWS_BUCKET_NAME: getConfig('aws.bucket', process.env.AWS_BUCKET || 'your-s3-bucket'),
  AWS_REGION: getConfig('aws.region', process.env.AWS_REGION || 'us-west-2'),
  AWS_ACCESS_KEY_ID: getConfig('aws.accessKeyId', process.env.AWS_ACCESS_KEY_ID),
  AWS_SECRET_ACCESS_KEY: getConfig('aws.secretAccessKey', process.env.AWS_SECRET_ACCESS_KEY),
}