-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Okt 17. 21:30
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `snake`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `score` int(11) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `sorsolhato` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- A tábla adatainak kiíratása `user`
--

INSERT INTO `user` (`id`, `name`, `score`, `timestamp`, `sorsolhato`) VALUES
(1, 'Berta Barnabás', 0, '2025-10-17 21:29:37', 1),
(2, 'Bokor Richárd', 0, '2025-10-17 21:29:37', 1),
(3, 'Dani Benedek', 0, '2025-10-17 21:29:37', 1),
(4, 'Döme Zoltán', 0, '2025-10-17 21:29:37', 1),
(5, 'Fodor Adrián László', 0, '2025-10-17 21:29:37', 1),
(6, 'Guvat Bence József', 0, '2025-10-17 21:29:37', 1),
(7, 'Herczeg Máté János', 0, '2025-10-17 21:29:37', 1),
(8, 'Kardos Zoltán', 0, '2025-10-17 21:29:37', 1),
(9, 'Kis David Csaba', 0, '2025-10-17 21:29:37', 1),
(10, 'Kis Marcell Zsombor', 0, '2025-10-17 21:29:37', 1),
(11, 'Kriván Balázs', 0, '2025-10-17 21:29:37', 1),
(12, 'Kulcsár Tamás Ámon', 0, '2025-10-17 21:29:37', 1),
(13, 'Miklós Martin', 0, '2025-10-17 21:29:37', 1),
(14, 'Répa Norbert', 0, '2025-10-17 21:29:37', 1),
(15, 'Sötét Ármin', 0, '2025-10-17 21:29:37', 1),
(16, 'Suba Benjamin', 0, '2025-10-17 21:29:37', 1),
(17, 'Szabó Bence', 0, '2025-10-17 21:29:37', 1),
(18, 'Szalontai László', 0, '2025-10-17 21:29:37', 1),
(19, 'Tokai Ádám', 0, '2025-10-17 21:29:37', 1),
(20, 'Tóth László Gábor', 0, '2025-10-17 21:29:37', 1),
(21, 'Börcsök Bendegúz Richárd', 0, '2025-10-17 21:29:37', 1),
(22, 'Garai Gergő Zoltán', 0, '2025-10-17 21:29:37', 1),
(23, 'Gera Márk', 0, '2025-10-17 21:29:37', 1),
(24, 'Gulyás Zsolt', 0, '2025-10-17 21:29:37', 1),
(25, 'Juhász Gergely István', 0, '2025-10-17 21:29:37', 1),
(26, 'Kripner Félix', 0, '2025-10-17 21:29:37', 1),
(27, 'Mucsi Dániel Zsolt', 0, '2025-10-17 21:29:37', 1),
(28, 'Németh Krisztofer', 0, '2025-10-17 21:29:37', 1),
(29, 'Őze Milán Levente', 0, '2025-10-17 21:29:37', 1),
(30, 'Pósa Krisztián Márk', 0, '2025-10-17 21:29:37', 1),
(31, 'Szélpál Máté', 0, '2025-10-17 21:29:37', 1),
(32, 'Szitás Ádám', 0, '2025-10-17 21:29:37', 1),
(33, 'Tóth Dzsenifer', 0, '2025-10-17 21:29:37', 1),
(34, 'Wöller Tamás', 0, '2025-10-17 21:29:37', 1),
(35, 'Zsikai Zétény', 0, '2025-10-17 21:29:37', 1);

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
