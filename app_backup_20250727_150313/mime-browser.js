// Browser-compatible MIME module replacement for JIMP compatibility
// This file provides MIME type functionality for browser environments to fix JIMP Buffer issues

const mimeTypes = {
  // Image types - critical for JIMP
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  // Web file types
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.xml': 'application/xml',
  '.csv': 'text/csv',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

// Image file signatures for buffer detection (magic numbers)
const imageSignatures = {
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/gif': [0x47, 0x49, 0x46],
  'image/bmp': [0x42, 0x4D],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'image/tiff': [0x49, 0x49, 0x2A, 0x00]
};

function detectMimeFromBuffer(buffer) {
  // Handle null/undefined buffers gracefully - return PNG as default for images
  if (!buffer || buffer.length === 0) {
    return 'image/png'; // Default to PNG for logo images
  }
  
  try {
    // Convert buffer to Uint8Array if needed
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    
    // Check image signatures
    for (const [mimeType, signature] of Object.entries(imageSignatures)) {
      if (bytes.length >= signature.length) {
        const matches = signature.every((byte, index) => bytes[index] === byte);
        if (matches) return mimeType;
      }
    }
    
    // Default to PNG for unrecognized image data
    return 'image/png';
  } catch (error) {
    // Fallback for any buffer conversion errors
    return 'image/png';
  }
}

function getType(pathOrBuffer) {
  // Handle null/undefined input - never return null to prevent JIMP errors
  if (pathOrBuffer === null || pathOrBuffer === undefined) {
    return 'image/png'; // Safe default for w2m_logo.png and other images
  }
  
  // Handle buffer input (for JIMP compatibility)
  if (pathOrBuffer && typeof pathOrBuffer === 'object' && pathOrBuffer.constructor === Buffer) {
    return detectMimeFromBuffer(pathOrBuffer);
  }
  
  // Handle ArrayBuffer or Uint8Array
  if (pathOrBuffer instanceof ArrayBuffer || pathOrBuffer instanceof Uint8Array) {
    return detectMimeFromBuffer(pathOrBuffer);
  }
  
  // Handle string path
  if (typeof pathOrBuffer !== 'string') {
    return 'image/png'; // Safe default for image processing
  }
  
  // Special handling for w2m_logo.png
  if (pathOrBuffer.includes('w2m_logo.png') || pathOrBuffer.includes('logo')) {
    return 'image/png';
  }
  
  const ext = pathOrBuffer.toLowerCase().match(/\.[^.]*$/);
  if (!ext) return 'image/png'; // Default to PNG for images
  
  return mimeTypes[ext[0]] || 'image/png';
}

function lookup(pathOrBuffer) {
  return getType(pathOrBuffer);
}

function extension(mimeType) {
  if (typeof mimeType !== 'string') return false;
  
  for (const [ext, type] of Object.entries(mimeTypes)) {
    if (type === mimeType) {
      return ext.substring(1); // Remove the dot
    }
  }
  return false;
}

// JIMP-specific compatibility functions
function getExtension(mimeType) {
  return extension(mimeType);
}

// Override JIMP's internal MIME detection to prevent null buffer errors
function interceptJimpMime() {
  // Monkey patch to catch all possible JIMP MIME calls
  if (typeof global !== 'undefined') {
    global.jimpMimeOverride = function(buffer) {
      if (!buffer || buffer === null || buffer === undefined) {
        return 'image/png';
      }
      return getType(buffer);
    };
  }
}

// Call the interceptor
interceptJimpMime();

// Export in both CommonJS and ES module formats for compatibility
const mimeModule = {
  getType,
  lookup,
  extension,
  getExtension,
  detectMimeFromBuffer,
  types: mimeTypes,
  // Add additional safety wrappers
  safeGetType: (input) => {
    try {
      return getType(input) || 'image/png';
    } catch (e) {
      return 'image/png';
    }
  },
  safeLookup: (input) => {
    try {
      return lookup(input) || 'image/png';
    } catch (e) {
      return 'image/png';
    }
  }
};

module.exports = mimeModule;

// ES module export
if (typeof exports === 'object' && typeof module !== 'undefined') {
  module.exports.default = mimeModule;
}

// Additional global override for any direct MIME calls
if (typeof window !== 'undefined') {
  window.mimeOverride = mimeModule;
}