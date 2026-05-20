<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$token = '8320968608:AAGoXqKoeGLe6uPsdYPSisICjGOOdgO-6-0';
$chat_id = '403593894';

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || empty($data['text'])) {
    http_response_code(400);
    die('No data');
}

$text = $data['text'];

$url = "https://api.telegram.org/bot{$token}/sendMessage";
$payload = json_encode([
    'chat_id' => $chat_id,
    'text' => $text,
    'parse_mode' => 'HTML'
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($result === false || $http_code != 200) {
    http_response_code(502);
    echo 'Telegram API error';
    error_log("Telegram send error: HTTP $http_code, Response: $result");
    exit;
}

header('Content-Type: application/json');
echo $result;
?>
