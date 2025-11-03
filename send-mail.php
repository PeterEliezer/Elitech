<?php
header('Content-Type: application/json');

// Change this to your email
$to = 'petereliezer8@gmail.com';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';

    if ($name && $email && $message) {
        $subject = "New Contact Form Message from $name";
        $body = "Name: $name\nEmail: $email\nMessage:\n$message";
        $headers = "From: $email\r\nReply-To: $email\r\n";

        if (mail($to, $subject, $body, $headers)) {
            echo json_encode(["success" => true, "message" => "Message sent successfully!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to send message. Please try again later."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Please fill in all fields."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request."]);
} 