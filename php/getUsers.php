<?php

require_once('../components/php/environment.php');

$db = new Database('snake');

$result = $db->execute("SELECT `name` FROM `user`");

$db = null;

Util::setResponse($result);