<?php

require_once('../../common/php/environment.php');

$args = Util::getArgs();

if (!is_string($args["name"]))
    Util::setError("Nem jók az argumentumok!");

$db = new Database();

$result = $db->execute("UPDATE `user` SET `sorsolhato` = false WHERE `name` = :name", $args);

if ($result["affectedRows"] == 0)
    Util::setError("baj van gec");

$db = null;

Util::setResponse($result);