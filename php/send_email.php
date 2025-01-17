<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $name = $_POST['user_name'];
    $email = $_POST['user_email'];
    $subject = $_POST['subject'];
    $message = $_POST['message'];

    // Recipient email address (you can replace this with any email)
    $to = "joshdelmundo860@gmail.com"; 

    // Subject of the email
    $email_subject = "New message from: $name";

    // Body of the email
    $email_body = "
    You have received a new message from your contact form.\n
    Here are the details:\n\n
    Name: $name\n
    Email: $email\n
    Subject: $subject\n
    Message: $message
    ";

    // Email headers
    $headers = "From: $email\n";
    $headers .= "Reply-To: $email\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\n";

    // Send the email
    if (mail($to, $email_subject, $email_body, $headers)) {
        echo "Message sent successfully!";
    } else {
        echo "Message sending failed!";
    }
}
?>
