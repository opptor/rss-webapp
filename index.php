<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>jadu rss app</title>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap.min.css">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap-theme.min.css">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.0/js/bootstrap.min.js"></script>
    
<style type="text/css">
    body {
        background-color: #1D2A33
    }
    
    .container {
        background-color: #E7EEF6;
        padding: 100px;
        margin-top: 100px;
    }
    
    .row {
        padding: 5px;
    }
    
    .alert-danger {
        max-width: 260px;
        text-align: center;
    }
    
</style>
</head>
<body>
<?php
/**
* index script for the rss feed application
* handles user login 
*
* @author Torsten Oppermann
* @since 17.03.2015
*/

// enforce https
if($_SERVER["HTTPS"] != "on") {
    header("Location: https://" . $_SERVER["HTTP_HOST"] . $_SERVER["REQUEST_URI"]);
    exit();
}

// include db configuration
require_once("config/db.php");

// instantiate login object
require_once("classes/Login.php");
$login = new Login();

// check if user is logged in and render the appropriate view
if ($login->isUserLoggedIn() == true) {
    include("views/dashboard.php");
} else {
    include("views/login_form.php");
}
?>
    
</body>
</html>