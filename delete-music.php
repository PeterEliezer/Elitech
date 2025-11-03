<?php
header('Content-Type: application/json');

// Allow CORS for admin access
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['filename']) || empty($input['filename'])) {
    echo json_encode(['success' => false, 'message' => 'Filename is required']);
    exit;
}

$filename = $input['filename'];

// Security: Only allow alphanumeric characters, dots, hyphens, and underscores
if (!preg_match('/^[a-zA-Z0-9._-]+$/', $filename)) {
    echo json_encode(['success' => false, 'message' => 'Invalid filename']);
    exit;
}

// Define upload directory
$uploadDir = 'uploads/';

// Check if upload directory exists
if (!is_dir($uploadDir)) {
    echo json_encode(['success' => false, 'message' => 'Upload directory not found']);
    exit;
}

// Full path to the file
$filePath = $uploadDir . $filename;

// Check if file exists
if (!file_exists($filePath)) {
    echo json_encode(['success' => false, 'message' => 'File not found']);
    exit;
}

// Check if it's actually an audio file
$allowedExtensions = ['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg'];
$fileExtension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

if (!in_array($fileExtension, $allowedExtensions)) {
    echo json_encode(['success' => false, 'message' => 'Invalid file type']);
    exit;
}

// Try to delete the file
if (unlink($filePath)) {
    // Also delete the metadata file if it exists
    $metadataFile = $uploadDir . pathinfo($filename, PATHINFO_FILENAME) . '.json';
    if (file_exists($metadataFile)) {
        unlink($metadataFile);
    }
    
    echo json_encode(['success' => true, 'message' => 'File deleted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to delete file']);
}
?> 