#!/usr/bin/env python3
"""
Simple HTTP server for EliTech music management
Handles file uploads, listing, and deletion
"""

import os
import json
import shutil
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs, unquote
import cgi
import datetime
from pathlib import Path

# Configuration
PORT = 8000
UPLOADS_DIR = "uploads"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {'.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg'}

# Create uploads directory if it doesn't exist
os.makedirs(UPLOADS_DIR, exist_ok=True)

class MusicHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # Handle CORS
        self.send_cors_headers()
        
        if path == '/list-music.php':
            self.handle_list_music()
        elif path.startswith('/uploads/'):
            self.handle_file_serve(path)
        else:
            self.handle_static_file(path)
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # Handle CORS
        self.send_cors_headers()
        
        if path == '/upload.php':
            self.handle_upload()
        elif path == '/delete-music.php':
            self.handle_delete()
        else:
            self.send_error(404, "Not Found")
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_cors_headers()
        self.send_response(200)
        self.end_headers()
    
    def send_cors_headers(self):
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def handle_list_music(self):
        """Handle music listing request"""
        try:
            metadata = self.load_metadata()
            music_files = []
            
            for filename in os.listdir(UPLOADS_DIR):
                if filename == 'metadata.json':
                    continue
                    
                file_path = os.path.join(UPLOADS_DIR, filename)
                if os.path.isfile(file_path):
                    file_ext = Path(filename).suffix.lower()
                    if file_ext in ALLOWED_EXTENSIONS:
                        stats = os.stat(file_path)
                        music_info = metadata.get(filename, {})
                        
                        music_files.append({
                            'filename': filename,
                            'url': f'http://localhost:{PORT}/uploads/{filename}',
                            'title': music_info.get('title', Path(filename).stem),
                            'artist': music_info.get('artist', 'Unknown Artist'),
                            'description': music_info.get('description', ''),
                            'upload_date': music_info.get('upload_date', datetime.datetime.fromtimestamp(stats.st_mtime).isoformat()),
                            'file_size': music_info.get('file_size', stats.st_size)
                        })
            
            # Sort by upload date (newest first)
            music_files.sort(key=lambda x: x['upload_date'], reverse=True)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(music_files).encode())
            
        except Exception as e:
            self.send_error(500, f"Error listing music: {str(e)}")
    
    def handle_upload(self):
        """Handle file upload request"""
        try:
            # Parse multipart form data
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD': 'POST'}
            )
            
            if 'music' not in form:
                self.send_error(400, "No file uploaded")
                return
            
            fileitem = form['music']
            if not fileitem.filename:
                self.send_error(400, "No file selected")
                return
            
            # Validate file extension
            file_ext = Path(fileitem.filename).suffix.lower()
            if file_ext not in ALLOWED_EXTENSIONS:
                self.send_error(400, "Invalid file type")
                return
            
            # Sanitize filename
            filename = "".join(c for c in fileitem.filename if c.isalnum() or c in "._-")
            file_path = os.path.join(UPLOADS_DIR, filename)
            
            # Check file size
            fileitem.file.seek(0, 2)  # Seek to end
            file_size = fileitem.file.tell()
            fileitem.file.seek(0)  # Reset to beginning
            
            if file_size > MAX_FILE_SIZE:
                self.send_error(400, "File too large")
                return
            
            # Save file
            with open(file_path, 'wb') as f:
                shutil.copyfileobj(fileitem.file, f)
            
            # Save metadata
            title = form.getvalue('title', Path(filename).stem)
            artist = form.getvalue('artist', 'Unknown Artist')
            description = form.getvalue('description', '')
            
            metadata = self.load_metadata()
            metadata[filename] = {
                'title': title,
                'artist': artist,
                'description': description,
                'upload_date': datetime.datetime.now().isoformat(),
                'file_size': file_size
            }
            self.save_metadata(metadata)
            
            # Send success response
            response = {
                'success': True,
                'message': 'Music uploaded successfully!',
                'filename': filename
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_error(500, f"Upload error: {str(e)}")
    
    def handle_delete(self):
        """Handle file deletion request"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())
            
            filename = data.get('filename')
            if not filename:
                self.send_error(400, "Filename is required")
                return
            
            # Validate filename
            if not all(c.isalnum() or c in "._-" for c in filename):
                self.send_error(400, "Invalid filename")
                return
            
            file_path = os.path.join(UPLOADS_DIR, filename)
            if not os.path.exists(file_path):
                self.send_error(404, "File not found")
                return
            
            # Delete file
            os.remove(file_path)
            
            # Remove from metadata
            metadata = self.load_metadata()
            if filename in metadata:
                del metadata[filename]
                self.save_metadata(metadata)
            
            response = {
                'success': True,
                'message': 'File deleted successfully'
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_error(500, f"Delete error: {str(e)}")
    
    def handle_file_serve(self, path):
        """Serve uploaded files"""
        try:
            filename = unquote(path[9:])  # Remove '/uploads/' prefix
            file_path = os.path.join(UPLOADS_DIR, filename)
            
            if not os.path.exists(file_path):
                self.send_error(404, "File not found")
                return
            
            # Get file info
            file_size = os.path.getsize(file_path)
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                mime_type = 'application/octet-stream'
            
            # Send file
            self.send_response(200)
            self.send_header('Content-Type', mime_type)
            self.send_header('Content-Length', str(file_size))
            self.end_headers()
            
            with open(file_path, 'rb') as f:
                shutil.copyfileobj(f, self.wfile)
                
        except Exception as e:
            self.send_error(500, f"File serve error: {str(e)}")
    
    def handle_static_file(self, path):
        """Serve static files"""
        try:
            if path == '/':
                path = '/index.html'
            
            file_path = path[1:]  # Remove leading slash
            if not os.path.exists(file_path):
                self.send_error(404, "File not found")
                return
            
            # Get file info
            file_size = os.path.getsize(file_path)
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                mime_type = 'application/octet-stream'
            
            # Send file
            self.send_response(200)
            self.send_header('Content-Type', mime_type)
            self.send_header('Content-Length', str(file_size))
            self.end_headers()
            
            with open(file_path, 'rb') as f:
                shutil.copyfileobj(f, self.wfile)
                
        except Exception as e:
            self.send_error(500, f"Static file error: {str(e)}")
    
    def load_metadata(self):
        """Load metadata from file"""
        metadata_path = os.path.join(UPLOADS_DIR, 'metadata.json')
        if os.path.exists(metadata_path):
            try:
                with open(metadata_path, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def save_metadata(self, metadata):
        """Save metadata to file"""
        metadata_path = os.path.join(UPLOADS_DIR, 'metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
    
    def log_message(self, format, *args):
        """Custom logging"""
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def main():
    """Start the server"""
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, MusicHandler)
    
    print(f"🚀 EliTech Music Server starting...")
    print(f"📁 Uploads directory: {os.path.abspath(UPLOADS_DIR)}")
    print(f"🌐 Server running at: http://localhost:{PORT}")
    print(f"🎵 Admin page: http://localhost:{PORT}/admin.html")
    print(f"🏠 Main site: http://localhost:{PORT}/index.html")
    print(f"📋 Music API: http://localhost:{PORT}/list-music.php")
    print(f"⬆️  Upload API: http://localhost:{PORT}/upload.php")
    print(f"❌ Delete API: http://localhost:{PORT}/delete-music.php")
    print(f"\n🛑 Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n🛑 Shutting down server...")
        httpd.server_close()

if __name__ == '__main__':
    main() 