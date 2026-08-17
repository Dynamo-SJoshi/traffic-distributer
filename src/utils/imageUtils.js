/**
 * Normalizes image URLs to ensure external links (like Google Drive, Dropbox, etc.)
 * convert into direct raw image stream URLs that HTML <img> tags can render.
 */
export function normalizeImageUrl(url) {
  if (!url) return '/logo.jpg';
  let trimmed = String(url).trim();

  // 1. Google Drive Link Converter
  if (trimmed.includes('drive.google.com')) {
    // Match /file/d/FILE_ID/view or /file/d/FILE_ID/edit
    const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    // Match ?id=FILE_ID or &id=FILE_ID
    const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);

    const fileId = (matchFileD && matchFileD[1]) || (matchIdParam && matchIdParam[1]);

    if (fileId) {
      // Return Google Drive Direct Content CDN URL
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // 2. Dropbox Link Converter
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
  }

  return trimmed;
}
