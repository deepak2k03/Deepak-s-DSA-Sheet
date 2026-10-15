const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} = require('@aws-sdk/client-s3');

/**
 * Checks if all required Cloudflare R2 environment variables are configured.
 */
const isR2Configured = () => {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env;
  return Boolean(
    R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET_NAME &&
    !R2_ACCOUNT_ID.includes('your_') &&
    !R2_ACCESS_KEY_ID.includes('your_')
  );
};

let cachedR2Client = null;

/**
 * Returns an initialized AWS S3Client configured for Cloudflare R2.
 */
const getR2Client = () => {
  if (cachedR2Client) return cachedR2Client;

  if (!isR2Configured()) {
    return null;
  }

  const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  cachedR2Client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  return cachedR2Client;
};

/**
 * Uploads an HTML file or buffer directly to Cloudflare R2.
 * @param {Object} params
 * @param {string} params.key - R2 object key (e.g. visualizers/binary-search.html)
 * @param {Buffer|string} params.body - File buffer or string content
 * @param {string} [params.contentType='text/html; charset=utf-8']
 */
const uploadToR2 = async ({ key, body, contentType = 'text/html; charset=utf-8' }) => {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured. Missing R2 environment variables.');
  }

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  return await client.send(command);
};

/**
 * Retrieves an object from Cloudflare R2 as a readable stream.
 * @param {Object} params
 * @param {string} params.key - R2 object key
 */
const getObjectFromR2 = async ({ key }) => {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured.');
  }

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  const response = await client.send(command);
  return {
    bodyStream: response.Body,
    contentType: response.ContentType || 'text/html; charset=utf-8',
    contentLength: response.ContentLength,
    etag: response.ETag,
  };
};

/**
 * Deletes an object from Cloudflare R2.
 * @param {Object} params
 * @param {string} params.key - R2 object key
 */
const deleteFromR2 = async ({ key }) => {
  const client = getR2Client();
  if (!client) {
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  return await client.send(command);
};

/**
 * Retrieves an object's string content from Cloudflare R2.
 * @param {Object} params
 * @param {string} params.key - R2 object key
 */
const getTextFromR2 = async ({ key }) => {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured.');
  }

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  const response = await client.send(command);
  if (response.Body && typeof response.Body.transformToString === 'function') {
    return await response.Body.transformToString('utf-8');
  }

  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
};

/**
 * Checks R2 bucket connectivity.
 */
const checkR2Health = async () => {
  if (!isR2Configured()) {
    return {
      configured: false,
      message: 'R2 environment variables are not configured.',
    };
  }

  try {
    const client = getR2Client();
    const command = new HeadBucketCommand({
      Bucket: process.env.R2_BUCKET_NAME,
    });
    await client.send(command);
    return {
      configured: true,
      bucket: process.env.R2_BUCKET_NAME,
      accountId: process.env.R2_ACCOUNT_ID,
      publicBaseUrl: process.env.R2_PUBLIC_BASE_URL || null,
      status: 'connected',
    };
  } catch (error) {
    return {
      configured: true,
      bucket: process.env.R2_BUCKET_NAME,
      status: 'error',
      message: error.message,
    };
  }
};

module.exports = {
  isR2Configured,
  getR2Client,
  uploadToR2,
  getObjectFromR2,
  getTextFromR2,
  deleteFromR2,
  checkR2Health,
};

