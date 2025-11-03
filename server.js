const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Sanitize filename
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '');
        cb(null, sanitizedName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/x-m4a', 'audio/m4a', 'audio/flac', 'audio/x-flac'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'), false);
        }
    }
});

// Metadata file path
const metadataFile = path.join(uploadsDir, 'metadata.json');

// Load metadata
function loadMetadata() {
    if (fs.existsSync(metadataFile)) {
        try {
            return JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
        } catch (error) {
            console.error('Error loading metadata:', error);
            return {};
        }
    }
    return {};
}

// Save metadata
function saveMetadata(metadata) {
    try {
        fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
    } catch (error) {
        console.error('Error saving metadata:', error);
    }
}

// Upload endpoint
app.post('/upload.php', upload.single('music'), (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: 'No file uploaded.' });
        }

        const title = req.body.title || path.parse(req.file.originalname).name;
        const artist = req.body.artist || 'Unknown Artist';
        const description = req.body.description || '';

        // Load existing metadata
        const metadata = loadMetadata();

        // Add new file metadata
        metadata[req.file.filename] = {
            title: title,
            artist: artist,
            description: description,
            upload_date: new Date().toISOString(),
            file_size: req.file.size
        };

        // Save metadata
        saveMetadata(metadata);

        res.json({
            success: true,
            message: 'Music uploaded successfully!',
            filename: req.file.filename
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.json({ success: false, message: 'Upload failed: ' + error.message });
    }
});

// List music endpoint
app.get('/list-music.php', (req, res) => {
    try {
        const metadata = loadMetadata();
        const musicFiles = [];

        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            
            files.forEach(file => {
                if (file !== 'metadata.json' && /\.(mp3|wav|m4a|flac|aac|ogg)$/i.test(file)) {
                    const filePath = path.join(uploadsDir, file);
                    const stats = fs.statSync(filePath);
                    
                    musicFiles.push({
                        filename: file,
                        url: `http://localhost:${PORT}/uploads/${encodeURIComponent(file)}`,
                        title: metadata[file]?.title || path.parse(file).name,
                        artist: metadata[file]?.artist || 'Unknown Artist',
                        description: metadata[file]?.description || '',
                        upload_date: metadata[file]?.upload_date || stats.mtime.toISOString(),
                        file_size: metadata[file]?.file_size || stats.size
                    });
                }
            });
        }

        // Sort by upload date (newest first)
        musicFiles.sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));

        res.json(musicFiles);

    } catch (error) {
        console.error('List music error:', error);
        res.json([]);
    }
});

// Delete music endpoint
app.post('/delete-music.php', (req, res) => {
    try {
        const { filename } = req.body;

        if (!filename) {
            return res.json({ success: false, message: 'Filename is required' });
        }

        // Security: Only allow alphanumeric characters, dots, hyphens, and underscores
        if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
            return res.json({ success: false, message: 'Invalid filename' });
        }

        const filePath = path.join(uploadsDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.json({ success: false, message: 'File not found' });
        }

        // Check if it's actually an audio file
        const allowedExtensions = ['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg'];
        const fileExtension = path.extname(filename).toLowerCase().substring(1);

        if (!allowedExtensions.includes(fileExtension)) {
            return res.json({ success: false, message: 'Invalid file type' });
        }

        // Delete the file
        fs.unlinkSync(filePath);

        // Delete metadata
        const metadata = loadMetadata();
        if (metadata[filename]) {
            delete metadata[filename];
            saveMetadata(metadata);
        }

        res.json({ success: true, message: 'File deleted successfully' });

    } catch (error) {
        console.error('Delete music error:', error);
        res.json({ success: false, message: 'Failed to delete file: ' + error.message });
    }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
    console.log(`🎵 Admin page: http://localhost:${PORT}/admin.html`);
    console.log(`🏠 Main site: http://localhost:${PORT}/index.html`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
}); 