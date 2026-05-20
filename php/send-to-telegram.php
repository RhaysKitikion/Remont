<?php
$token = '8320968608:AAGoXqKoeGLe6uPsdYPSisICjGOOdgO-6-0';
$chat_id = '403593894';

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || empty($data['text'])) {
    http_response_code(400);
    die('No data');
}

$text = $data['text'];

$url = "https://api.telegram.org/bot{$token}/sendMessage";
$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode([
            'chat_id' => $chat_id,
            'text' => $text,
            'parse_mode' => 'HTML'
        ])
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    http_response_code(502);
    die('Telegram API error');
}

header('Content-Type: application/json');
echo $result;
?>