<?php

require_once('../../common/php/environment.php');

$db = new Database();

$result = $db->execute("SELECT `name` FROM `user`");

$db = null;

Util::setResponse($result);