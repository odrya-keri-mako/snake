<?php

require_once('../../common/php/environment.php');

$db = new Database();

$result = $db->execute("SELECT DISTINCT `name` FROM `user` WHERE `sorsolhato`");

$db = null;

Util::setResponse($result);