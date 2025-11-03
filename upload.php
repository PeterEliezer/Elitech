<?php
header('Content-Type: application/json');

// Allow CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// MySQL connection
$host = 'sql308.byetcluster.com'; // from your screenshot
$dbname = 'if0_39602816_music_uploads';
$username = 'if0_39602816_music_uploads';   // Replace with your actual username
$password = 'Muvuzankwaya8';   // Replace with your actual password

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

// Upload path
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$response = ["success" => false, "message" => ""];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['music'])) {
    $file = $_FILES['music'];
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    $artist = isset($_POST['artist']) ? trim($_POST['artist']) : '';
    $description = isset($_POST['description']) ? trim($_POST['description']) : '';

    $allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/x-m4a', 'audio/m4a', 'audio/flac', 'audio/x-flac'];
    $maxSize = 50 * 1024 * 1024;

    if ($file['error'] === UPLOAD_ERR_OK) {
        if (in_array($file['type'], $allowedTypes) && $file['size'] <= $maxSize) {
            // Sanitize and make unique filename
            $originalName = basename($file['name']);
            $cleanName = preg_replace('/[^a-zA-Z0-9._-]/', '', $originalName);
            $filename = uniqid() . '_' . $cleanName;
            $targetPath = $uploadDir . $filename;

            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                $title = $title !== '' ? $title : pathinfo($originalName, PATHINFO_FILENAME);
                $artist = $artist !== '' ? $artist : 'Unknown Artist';
                $uploadedAt = date('Y-m-d H:i:s');
                $fileSize = $file['size'];

                $stmt = $conn->prepare("INSERT INTO music_files (title, artist, description, filename, uploaded_at) VALUES (?, ?, ?, ?, ?)");
                $stmt->bind_param("sssss", $title, $artist, $description, $filename, $uploadedAt);
                $stmt->execute();

                $response["success"] = true;
                $response["message"] = "Music uploaded successfully!";
                $response["filename"] = $filename;
            } else {
                $response["message"] = "Failed to move uploaded file.";
            }
        } else {
            $response["message"] = "Invalid file type or size exceeds 50MB.";
        }
    } else {
        $response["message"] = "Upload error: " . $file['error'];
    }
} else {
    $response["message"] = "No file uploaded.";
}

echo json_encode($response);
?>
