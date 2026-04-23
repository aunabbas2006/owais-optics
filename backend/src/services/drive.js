const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

let driveClient = null;
let frameCache = null;
let frameCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

const DEMO_FRAMES = [
    { id: 'demo-1', name: 'Round_Black.jpg', shape: 'Round', color: 'Black', thumbnailLink: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=400&auto=format&fit=crop' },
    { id: 'demo-2', name: 'Round_Gold.jpg', shape: 'Round', color: 'Gold', thumbnailLink: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=400&auto=format&fit=crop' },
    { id: 'demo-3', name: 'Round_Silver.jpg', shape: 'Round', color: 'Silver', thumbnailLink: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=400&auto=format&fit=crop' },
    { id: 'demo-4', name: 'Aviator_Gold.jpg', shape: 'Aviator', color: 'Gold', thumbnailLink: 'https://images.unsplash.com/photo-1511499767390-90342f567517?q=80&w=400&auto=format&fit=crop' },
    { id: 'demo-5', name: 'Aviator_Black.jpg', shape: 'Aviator', color: 'Black', thumbnailLink: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=400&auto=format&fit=crop' },
    { id: 'demo-6', name: 'Aviator_Silver.jpg', shape: 'Aviator', color: 'Silver', thumbnailLink: 'https://images.unsplash.com/photo-1509100104048-73c19386e5c1?q=80&w=400&auto=format&fit=crop' },
    { id: 'demo-7', name: 'Cat-Eye_Tortoise.jpg', shape: 'Cat-Eye', color: 'Tortoise', thumbnailLink: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=400&auto=format&fit=crop' },
    { id: 'demo-8', name: 'Cat-Eye_Black.jpg', shape: 'Cat-Eye', color: 'Black', thumbnailLink: 'https://images.unsplash.com/photo-1511499767390-90342f567517?q=80&w=400&auto=format&fit=crop' },
];

function getDriveClient() {
    if (driveClient) return driveClient;
    
    let authOptions = {};
    const credentialsEnv = process.env.GOOGLE_CREDENTIALS;
    const credentialsPath = path.join(__dirname, '..', '..', 'credentials.json');

    if (credentialsEnv) {
        try {
            authOptions = {
                credentials: JSON.parse(credentialsEnv),
                scopes: ['https://www.googleapis.com/auth/drive.readonly'],
            };
        } catch (err) {
            console.error('❌ GOOGLE_CREDENTIALS parse failed:', err.message);
            return null;
        }
    } else if (fs.existsSync(credentialsPath)) {
        authOptions = {
            keyFile: credentialsPath,
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        };
    } else {
        return null;
    }

    try {
        const auth = new google.auth.GoogleAuth(authOptions);
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
