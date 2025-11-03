<?php
header('Content-Type: application/json');

// Allow CORS for admin access
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

$uploadDir = __DIR__ . '/uploads/';
$metadataFile = $uploadDir . 'metadata.json';
$baseUrl = (isset($_SERVER['HTTPS']) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']) . '/uploads/';

$metadata = file_exists($metadataFile) ? json_decode(file_get_contents($metadataFile), true) : [];
$musicFiles = [];

if (is_dir($uploadDir)) {
    $files = scandir($uploadDir);
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..' && preg_match('/\.(mp3|wav|m4a|flac|aac|ogg)$/i', $file)) {
            $musicFiles[] = [
                'filename' => $file,
                'url' => $baseUrl . rawurlencode($file),
                'title' => isset($metadata[$file]['title']) ? $metadata[$file]['title'] : pathinfo($file, PATHINFO_FILENAME),
                'artist' => isset($metadata[$file]['artist']) ? $metadata[$file]['artist'] : 'Unknown Artist',
                'description' => isset($metadata[$file]['description']) ? $metadata[$file]['description'] : '',
                'upload_date' => isset($metadata[$file]['upload_date']) ? $metadata[$file]['upload_date'] : '',
                'file_size' => isset($metadata[$file]['file_size']) ? $metadata[$file]['file_size'] : filesize($uploadDir . $file)
            ];
        }
    }
}

// Sort by upload date (newest first)
usort($musicFiles, function($a, $b) {
    return strtotime($b['upload_date']) - strtotime($a['upload_date']);
});

echo json_encode($musicFiles); 