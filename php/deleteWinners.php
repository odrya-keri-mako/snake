<?php

require_once('../../common/php/environment.php');

$db = new Database();

$query = "UPDATE `user` SET `sorsolhato` = 1 WHERE `sorsolhato` = 0;";

$result = $db->execute($query);

$db = null;

Util::setResponse($result);