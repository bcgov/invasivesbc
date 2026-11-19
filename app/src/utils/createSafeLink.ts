/**
 * Converts a dynamic Base64 string into a safe, temporary Blob URL.
 * Primarily intended as a safe guard from SVG images.
 * @param {string} dataUri - The full string (e.g., "data:image/svg+xml;base64,...")
 */
export const createSafeLink = (dataUri: string | undefined) => {
  try {
    if (!dataUri) return;
    const parts = dataUri.split(',');
    if (parts.length < 2) throw new Error('Invalid Data URI format');

    const header = parts[0];
    const base64 = parts[1];

    const colonIndex = header.indexOf(':');
    const semiIndex = header.indexOf(';');

    if (colonIndex === -1 || semiIndex === -1 || semiIndex < colonIndex) {
      throw new Error('Could not parse MIME type from header');
    }

    const mime = header.substring(colonIndex + 1, semiIndex);

    // Convert Base64 to Blob
    const binaryStr = atob(base64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Invalid dynamic image format:', e);
    return '#';
  }
};
