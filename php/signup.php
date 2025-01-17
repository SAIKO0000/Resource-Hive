<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get the form data
    $fullname = $_POST['fullname'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $contact = $_POST['contact'];

    // Supabase credentials
    $supabaseUrl = 'https://zfhilnjskmqfedczzytn.supabase.co'; // Your Supabase URL
    $supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmaGlsbmpza21xZmVkY3p6eXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0OTcxMDAsImV4cCI6MjA0ODA3MzEwMH0.r_v1GAC38J1o3fyR9n1gUelnEHzuLic-IE2wTk_IyXY'; // Your Supabase API Key

    // Supabase API endpoint for auth signup
    $url = $supabaseUrl . '/auth/v1/signup';

    // Prepare data to be sent in the request
    $data = array(
        'email' => $email,
        'password' => $password,
        'data' => array(
            'full_name' => $fullname,
            'contact' => $contact
        )
    );

    // Create a cURL handle
    $ch = curl_init($url);

    // Set cURL options
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Authorization: Bearer ' . $supabaseKey,
        'Content-Type: application/json'
    ));
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    // Execute the request and capture the response
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // Check if the request was successful
    if ($httpCode == 200) {
        // Optionally, insert user details into a database
        // echo success message
        echo "User successfully created!";
    } else {
        // Handle errors (e.g., already registered email, weak password, etc.)
        $error = json_decode($response);
        echo "Signup failed: " . $error->message;
    }
} else {
    // If the request method is not POST, show an error message
    echo "Invalid request method.";
}
?>
