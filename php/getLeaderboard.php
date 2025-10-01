<?php
require_once('../../common/php/environment.php');

$db = new Database();

$query = "
    SELECT `name`, `score`, `timestamp`
    FROM `user`
    ORDER BY `score` desc
    LIMIT 10
";

$result = $db->execute($query);

Util::setResponse($result);

