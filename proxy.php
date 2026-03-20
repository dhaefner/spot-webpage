<?php

// PROXY WRAPPER FOR API TO AVAID LOCAL CORS ISSUES
// absolutely NOT INTENDED for production!!!!

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$date = $_GET['date'] ?? '';

if (!$date) {
    echo json_encode(["error" => "Missing date parameter"]);
    exit;
}

$apiUrl = "https://api.e-spotmarkt.de/data?date=" . urlencode($date);

$ch = curl_init($apiUrl);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Accept: application/json",
    "User-Agent: Mozilla/5.0"
]);

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$response = curl_exec($ch);

if ($response === false) {
    echo json_encode(["error" => curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

echo $response;