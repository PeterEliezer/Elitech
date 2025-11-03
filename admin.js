
const ADMIN_CREDENTIALS = {
    username: 'petereliezer',
    password: 'elitech2025'
};

function checkAuth() {
    console.log('Checking authentication...');
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    console.log('Is logged in:', isLoggedIn);
    
    if (isLoggedIn === 'true') {
        console.log('User is logged in, showing upload form');
        showUploadForm();
        loadMusicList();
    } else {
        console.log('User is not logged in, showing login form');
        showLoginForm();
    }
}

function showLoginForm() {
    console.log('Showing login form');
    const loginForm = document.getElementById('loginForm');
    const uploadForm = document.getElementById('uploadForm');
    
    if (loginForm && uploadForm) {
        loginForm.style.display = 'block';
        uploadForm.style.display = 'none';
    } else {
        console.error('Login or upload form elements not found');
    }
}

function showUploadForm() {
    console.log('Showing upload form');
    const loginForm = document.getElementById('loginForm');
    const uploadForm = document.getElementById('uploadForm');
    
    if (loginForm && uploadForm) {
        loginForm.style.display = 'none';
        uploadForm.style.display = 'block';
    } else {
        console.error('Login or upload form elements not found');
    }
}

function login(event) {
    event.preventDefault();
    console.log('Login attempt...');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Username entered:', username);
    console.log('Expected username:', ADMIN_CREDENTIALS.username);
    console.log('Password match:', password === ADMIN_CREDENTIALS.password);
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        console.log('Login successful!');
        sessionStorage.setItem('adminLoggedIn', 'true');
        showUploadForm();
        loadMusicList();
        showStatus('Login successful!', 'success');
    } else {
        console.log('Login failed - invalid credentials');
        showStatus('Invalid credentials. Please try again.', 'error');
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    showLoginForm();
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// File upload handling
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        document.getElementById('musicFile').files = files;
        updateFileDisplay(files[0]);
    }
}

// Update file display
function updateFileDisplay(file) {
    const uploadArea = document.querySelector('.file-upload-area');
    uploadArea.innerHTML = `
        <i class="fas fa-music"></i>
        <p><strong>${file.name}</strong></p>
        <p style="font-size: 0.9rem; margin-top: 10px; color: rgba(255, 255, 255, 0.6);">
            Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
    `;
}

// Upload music function
function uploadMusic(event) {
    event.preventDefault();
    
    const formData = new FormData();
    const fileInput = document.getElementById('musicFile');
    const title = document.getElementById('musicTitle').value;
    const artist = document.getElementById('musicArtist').value;
    const description = document.getElementById('musicDescription').value;
    
    if (!fileInput.files[0]) {
        showStatus('Please select a music file.', 'error');
        return;
    }
    
    formData.append('music', fileInput.files[0]);
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('description', description);
    
    const uploadBtn = document.getElementById('uploadBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    progressBar.style.display = 'block';
    
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', function(e) {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            progressFill.style.width = percentComplete + '%';
        }
    });
    
    xhr.addEventListener('load', function() {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    showStatus('Music uploaded successfully!', 'success');
                    resetForm();
                    loadMusicList();
                } else {
                    showStatus(response.message || 'Upload failed.', 'error');
                }
            } catch (e) {
                showStatus('Upload completed but response was invalid.', 'error');
            }
        } else {
            showStatus('Upload failed. Please try again.', 'error');
        }
        
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Music';
        progressBar.style.display = 'none';
        progressFill.style.width = '0%';
    });
    
    xhr.addEventListener('error', function() {
        showStatus('Upload failed. Please check your connection.', 'error');
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Music';
        progressBar.style.display = 'none';
        progressFill.style.width = '0%';
    });
    
    xhr.open('POST', 'upload.php');
    xhr.send(formData);
}

// Reset form
function resetForm() {
    document.getElementById('musicTitle').value = '';
    document.getElementById('musicArtist').value = '';
    document.getElementById('musicDescription').value = '';
    document.getElementById('musicFile').value = '';
    
    const uploadArea = document.querySelector('.file-upload-area');
    uploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <p>Click to select or drag & drop your music file here</p>
        <p style="font-size: 0.9rem; margin-top: 10px; color: rgba(255, 255, 255, 0.6);">
            Supported formats: MP3, WAV, FLAC, M4A
        </p>
    `;
}

// Load music list
function loadMusicList() {
    fetch('list-music.php')
        .then(response => response.json())
        .then(data => {
            const musicList = document.getElementById('musicList');
            musicList.innerHTML = '';
            
            if (data.length === 0) {
                musicList.innerHTML = '<p style="color: rgba(255, 255, 255, 0.6); text-align: center;">No music uploaded yet.</p>';
                return;
            }
            
            data.forEach(music => {
                const musicItem = document.createElement('div');
                musicItem.className = 'music-item';
                musicItem.innerHTML = `
                    <div class="music-info">
                        <div class="music-title">${music.title}</div>
                        <div class="music-artist">${music.artist}</div>
                    </div>
                    <button class="delete-btn" onclick="deleteMusic('${music.filename}')">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                musicList.appendChild(musicItem);
            });
        })
        .catch(error => {
            console.error('Error loading music list:', error);
            document.getElementById('musicList').innerHTML = 
                '<p style="color: #f44336; text-align: center;">Error loading music list.</p>';
        });
}

// Delete music function
function deleteMusic(filename) {
    if (confirm('Are you sure you want to delete this music file?')) {
        fetch('delete-music.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename: filename })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showStatus('Music deleted successfully!', 'success');
                loadMusicList();
            } else {
                showStatus(data.message || 'Delete failed.', 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting music:', error);
            showStatus('Delete failed. Please try again.', 'error');
        });
    }
}

// Show status message
function showStatus(message, type) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status-message status-${type}`;
    statusElement.style.display = 'block';
    
    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 5000);
}

// File input change handler
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('musicFile');
    fileInput.addEventListener('change', function() {
        if (this.files[0]) {
            updateFileDisplay(this.files[0]);
        }
    });
    
    checkAuth();
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Enter to submit forms
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        const activeForm = document.querySelector('form');
        if (activeForm) {
            activeForm.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape to logout
    if (event.key === 'Escape' && sessionStorage.getItem('adminLoggedIn') === 'true') {
        logout();
    }
}); 