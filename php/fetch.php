<?php
$data = array("user" => "grafg", "passwd" => "wrong-password");
$jsonData = json_encode($data);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://grafg1.spengergasse.at/verify");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
$result = curl_exec($ch);
$responseData = json_decode($result, true);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo $httpCode;
echo $responseData;
?>