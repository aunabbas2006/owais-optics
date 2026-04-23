const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

let driveClient = null;
let frameCache = null;
let frameCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

const DEMO_FRAMES = [
    { id: 'demo-1', name: 'Round_Black.jpg', shape: 'Round', color: 'Black', mimeType: 'image/jpeg' },
    { id: 'demo-2', name: 'Round_Gold.jpg', shape: 'Round', color: 'Gold', mimeType: 'image/jpeg' },
    { id: 'demo-3', name: 'Round_Silver.jpg', shape: 'Round', color: 'Silver', mimeType: 'image/jpeg' },
    { id: 'demo-4', name: 'Aviator_Gold.jpg', shape: 'Aviator', color: 'Gold', mimeType: 'image/jpeg' },
    { id: 'demo-5', name: 'Aviator_Black.jpg', shape: 'Aviator', color: 'Black', mimeType: 'image/jpeg' },
    { id: 'demo-6', name: 'Aviator_Silver.jpg', shape: 'Aviator', color: 'Silver', mimeType: 'image/jpeg' },
    { id: 'demo-7', name: 'Cat-Eye_Tortoise.jpg', shape: 'Cat-Eye', color: 'Tortoise', mimeType: 'image/jpeg' },
    { id: 'demo-8', name: 'Cat-Eye_Black.jpg', shape: 'Cat-Eye', color: 'Black', mimeType: 'image/jpeg' },
    { id: 'demo-9', name: 'Cat-Eye_Rose-Gold.jpg', shape: 'Cat-Eye', color: 'Rose Gold', mimeType: 'image/jpeg' },
    { id: 'demo-10', name: 'Rectangle_Black.jpg', shape: 'Rectangle', color: 'Black', mimeType: 'image/jpeg' },
    { id: 'demo-11', name: 'Rectangle_Blue.jpg', shape: 'Rectangle', color: 'Blue', mimeType: 'image/jpeg' },
    { id: 'demo-12', name: 'Rectangle_Tortoise.jpg', shape: 'Rectangle', color: 'Tortoise', mimeType: 'image/jpeg' },
    { id: 'demo-13', name: 'Wayfarer_Black.jpg', shape: 'Wayfarer', color: 'Black', mimeType: 'image/jpeg' },
    { id: 'demo-14', name: 'Wayfarer_Tortoise.jpg', shape: 'Wayfarer', color: 'Tortoise', mimeType: 'image/jpeg' },
    { id: 'demo-15', name: 'Rimless_Gold.jpg', shape: 'Rimless', color: 'Gold', mimeType: 'image/jpeg' },
    { id: 'demo-16', name: 'Rimless_Silver.jpg', shape: 'Rimless', color: 'Silver', mimeType: 'image/jpeg' },
];

function getDriveClient() {
    if (driveClient) return driveClient;
    const credentialsPath = path.join(__dirname, '..', '..', 'credentials.json');
    if (!fs.existsSync(credentialsPath)) return null;

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });
        driveClient = google.drive({ version: 'v3', auth });
        return driveClient;
    } catch (err) {
        console.error('❌ Google Drive init failed:', err.message);
        return null;
    }
}

function parseFrameName(filename) {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    const parts = nameWithoutExt.split('_');
    if (parts.length < 2) return { shape: parts[0] || 'Unknown', color: 'Unknown' };
    const shape = parts[0].replace(/-/g, '-');
    const color = parts.slice(1).join(' ').replace(/-/g, ' ');
    return { shape, color };
}

async function listFrames() {
    if (frameCache && (Date.now() - frameCacheTime) < CACHE_TTL) return frameCache;
    const drive = getDriveClient();
    const folderId = process.env.DRIVE_FOLDER_ID;

    if (!drive || !folderId || process.env.DEMO_MODE === 'true') {
        frameCache = DEMO_FRAMES;
        frameCacheTime = Date.now();
        return DEMO_FRAMES;
    }

    try {
        const allFiles = [];
        let pageToken = null;
        do {
            const response = await drive.files.list({
                q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed = false`,
                fields: 'nextPageToken, files(id, name, mimeType, thumbnailLink)',
                pageSize: 100,
                pageToken,
            });
            const files = response.data.files || [];
            files.forEach(file => {
                const { shape, color } = parseFrameName(file.name);
                allFiles.push({ id: file.id, name: file.name, shape, color, mimeType: file.mimeType, thumbnailLink: file.thumbnailLink });
            });
            pageToken = response.data.nextPageToken;
        } while (pageToken);

        frameCache = allFiles;
        frameCacheTime = Date.now();
        return allFiles;
    } catch (err) {
        console.error('❌ Drive fetch failed:', err.message);
        frameCache = DEMO_FRAMES;
        frameCacheTime = Date.now();
        return DEMO_FRAMES;
    }
}

async function getFrameImage(fileId) {
    if (fileId.startsWith('demo-') || process.env.DEMO_MODE === 'true') return null;
    const drive = getDriveClient();
    if (!drive) return null;
    try {
        const response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
        return response.data;
    } catch (err) {
        return null;
    }
}

module.exports = { listFrames, getFrameImage };
