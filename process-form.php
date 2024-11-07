<?php
header('Content-Type: application/json');

// Function to sanitize input
function sanitize_input($data)
{
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Function to send response
function send_response($success, $message)
{
    echo json_encode([
        'success' => $success,
        'message' => $message
    ]);
    exit;
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_response(false, 'Invalid request method');
}

// Get and sanitize form data
$name = isset($_POST['name']) ? sanitize_input($_POST['name']) : '';
$email = isset($_POST['email']) ? sanitize_input($_POST['email']) : '';
$message = isset($_POST['message']) ? sanitize_input($_POST['message']) : '';

// Validate data
if (empty($name) || empty($email) || empty($message)) {
    send_response(false, 'Please fill in all fields');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_response(false, 'Invalid email address');
}

// Your email configuration
$to = "your-email@lunamix.com"; // Replace with your email
$subject = "New Contact Form Submission from $name";

// Email content
$email_content = "
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2A4365; color: white; padding: 20px; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>New Contact Form Submission</h2>
        </div>
        <div class='content'>
            <p><strong>Name:</strong> $name</p>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Message:</strong></p>
            <p>" . nl2br($message) . "</p>
        </div>
        <div class='footer'>
            <p>This email was sent from your website contact form.</p>
        </div>
    </div>
</body>
</html>";

// Email headers
$headers = array(
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: ' . $name . ' <' . $email . '>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion()
);

// Anti-spam measures
$_SESSION['last_submission_time'] = time();

try {
    // Send email
    if (mail($to, $subject, $email_content, implode("\r\n", $headers))) {
        // Success
        send_response(true, 'Message sent successfully');
    } else {
        // Email sending failed
        send_response(false, 'Failed to send message');
    }
} catch (Exception $e) {
    // Log error (adjust path as needed)
    error_log("Form submission error: " . $e->getMessage(), 3, "error_log.txt");
    send_response(false, 'An error occurred while sending the message');
}
