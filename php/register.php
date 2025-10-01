<?php
require_once("../common/php/envionment.php");

$args = Util::getArgs();

if (!is_string($args["name"]) || mb_strlen($args["name"]) > 50)
    Util::setError("Nem helyes a név!");
if (!is_int($args["score"]))
    Util::setError("A scorenak intnek kell lennie!");

$db = new Database();

$query = "
    INSERT INTO `user` (`name`, `score`)
    VALUES (:name, :score)
";

$result = $db->execute($query, $args);

if (!$result["affectedRows"])
    Util::setError("Sikertelen adatfelvitel");

Util::setResponse();

