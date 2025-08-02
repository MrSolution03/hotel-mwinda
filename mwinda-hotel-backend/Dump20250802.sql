-- MySQL dump 10.13  Distrib 8.0.40, for macos14 (x86_64)
--
-- Host: 127.0.0.1    Database: mwinda_hotel_db
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `arrivalDate` datetime NOT NULL,
  `departureDate` datetime NOT NULL,
  `totalPrice` decimal(10,2) DEFAULT NULL,
  `status` enum('en attente','confirmée','annulée') DEFAULT 'en attente',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL,
  `roomId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `roomId` (`roomId`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; -- CORRIGÉ
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'2025-07-06 22:00:00','2025-07-08 22:00:00',100.00,'confirmée','2025-07-31 12:19:43','2025-07-31 12:20:05',4,2),(2,'2025-07-14 22:00:00','2025-07-16 22:00:00',100.00,'confirmée','2025-07-31 12:25:13','2025-07-31 14:24:21',4,2);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoiceNumber` varchar(255) DEFAULT NULL,
  `issueDate` datetime DEFAULT NULL,
  `pdfPath` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `bookingId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoiceNumber` (`invoiceNumber`),
  KEY `bookingId` (`bookingId`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`bookingId`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; -- CORRIGÉ
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,'INV-1-2025','2025-07-31 12:20:05','invoices/invoice-1.pdf','2025-07-31 12:20:05','2025-07-31 12:20:05',1),(2,'INV-2-2025','2025-07-31 14:24:21','invoices/invoice-2.pdf','2025-07-31 14:24:21','2025-07-31 14:24:21',2);
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `method` enum('Airtel Money','M-Pesa') NOT NULL,
  `transactionId` varchar(255) DEFAULT NULL,
  `status` enum('en attente','réussi','échoué') DEFAULT 'en attente',
  `paymentDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `bookingId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bookingId` (`bookingId`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`bookingId`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; -- CORRIGÉ
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,100.00,'Airtel Money','SIM_AirtelMoney_1753964405270','réussi','2025-07-31 12:20:05','2025-07-31 12:20:05','2025-07-31 12:20:05',1),(2,100.00,'Airtel Money','SIM_AirtelMoney_1753971861688','réussi','2025-07-31 14:24:21','2025-07-31 14:24:21','2025-07-31 14:24:21',2);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_images`
--

DROP TABLE IF EXISTS `room_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `roomId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `roomId` (`roomId`),
  CONSTRAINT `room_images_ibfk_1` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; -- CORRIGÉ
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_images`
--

LOCK TABLES `room_images` WRITE;
/*!40000 ALTER TABLE `room_images` DISABLE KEYS */;
INSERT INTO `room_images` VALUES (75,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754139955/mwinda_hotel/t5n9wczswtzh3baqgpyk.jpg','2025-08-02 13:05:55','2025-08-02 13:05:55',1),(76,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754139954/mwinda_hotel/ywzhsrnqftsxaexqz5e1.jpg','2025-08-02 13:05:55','2025-08-02 13:05:55',1),(77,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754139953/mwinda_hotel/myg2pagaa1jjjg9f6fpj.jpg','2025-08-02 13:05:55','2025-08-02 13:05:55',1),(78,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140046/mwinda_hotel/tdckx7ntgm6jfpeq40pi.jpg','2025-08-02 13:07:25','2025-08-02 13:07:25',2),(79,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140045/mwinda_hotel/fyyhxcrto72kitw8owtz.jpg','2025-08-02 13:07:25','2025-08-02 13:07:25',2),(80,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140044/mwinda_hotel/ky7e3myerk8tilbhoaak.jpg','2025-08-02 13:07:25','2025-08-02 13:07:25',2),(81,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140077/mwinda_hotel/cowvkvbr79qigat3dc78.jpg','2025-08-02 13:07:57','2025-08-02 13:07:57',3),(82,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140075/mwinda_hotel/qk3m2iru5drhiv2d7hkd.jpg','2025-08-02 13:07:57','2025-08-02 13:07:57',3),(83,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140101/mwinda_hotel/qlcblcuajuobd6rj7pgk.jpg','2025-08-02 13:08:21','2025-08-02 13:08:21',4),(84,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140130/mwinda_hotel/enr7qfybgaq0fiskm2nd.jpg','2025-08-02 13:08:50','2025-08-02 13:08:50',6),(85,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140158/mwinda_hotel/r6fqweyuyp6u4eg8vcdn.jpg','2025-08-02 13:09:18','2025-08-02 13:09:18',7),(86,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140185/mwinda_hotel/bldt6hyudkehw6r5gpq8.jpg','2025-08-02 13:09:45','2025-08-02 13:09:45',8),(87,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140216/mwinda_hotel/hc7mlidrb4iihfm0fpl3.jpg','2025-08-02 13:10:17','2025-08-02 13:10:17',9),(88,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140252/mwinda_hotel/spfsh5oxgyqgy4a5bf6z.jpg','2025-08-02 13:10:52','2025-08-02 13:10:52',10),(89,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140274/mwinda_hotel/xizna20vyxt4iujyv6nw.jpg','2025-08-02 13:11:14','2025-08-02 13:11:14',11),(90,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140299/mwinda_hotel/ak2tgdg2g1twyoukcsbf.jpg','2025-08-02 13:11:39','2025-08-02 13:11:39',12),(91,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140323/mwinda_hotel/qcpd53pqicinfzlsmvpe.jpg','2025-08-02 13:12:03','2025-08-02 13:12:03',13),(92,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140341/mwinda_hotel/w8mjmvjdkrmpn39bhypl.jpg','2025-08-02 13:12:20','2025-08-02 13:12:20',14),(93,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140358/mwinda_hotel/dnuczaje1iohn5imiwn5.jpg','2025-08-02 13:12:37','2025-08-02 13:12:37',15),(94,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140375/mwinda_hotel/khjg2curkjs670cl1zyt.jpg','2025-08-02 13:12:55','2025-08-02 13:12:55',16),(95,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140407/mwinda_hotel/nmn0ghbqtrqm4j2rtakl.jpg','2025-08-02 13:13:27','2025-08-02 13:13:27',17),(96,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140407/mwinda_hotel/rtmacnuf7ntixvaxj1kr.jpg','2025-08-02 13:13:27','2025-08-02 13:13:27',17),(97,'https://res.cloudinary.com/dxjmlnenh/image/upload/v1754140406/mwinda_hotel/iyiboyj1qodgcvceodwe.jpg','2025-08-02 13:13:27','2025-08-02 13:13:27',17);
/*!40000 ALTER TABLE `room_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `pricePerNight` decimal(10,2) NOT NULL,
  `status` enum('disponible','occupée','maintenance') DEFAULT 'disponible',
  `description` text,
  `amenities` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; -- CORRIGÉ
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'Chambre Simple Confort',60.00,'disponible','Idéale pour le voyageur seul, cette chambre offre tout le confort nécessaire dans un espace optimisé et élégant.','[\"Wifi\", \"Swimming pool\", \"Spa\"]','2025-07-31 12:25:21','2025-08-02 13:05:55'),(2,'Chambre Simple Économique',50.00,'disponible','Le meilleur rapport qualité-prix pour un séjour confortable et fonctionnel au cœur de Kolwezi.','[\"Wi-Fi gratuit\", \"TV Écran Plat\", \"Climatisation\"]','2025-07-31 12:25:21','2025-08-02 13:07:25'),(3,'Chambre Double Standard',90.00,'occupée','Parfaite pour les couples ou les collègues, avec un grand lit double confortable et une décoration apaisante.','[\"Wi-Fi gratuit\", \"TV Écran Plat\", \"Climatisation\", \"Mini-bar\"]','2025-07-31 12:25:21','2025-08-02 13:07:57'),(4,'Chambre Double Supérieure',110.00,'disponible','Plus spacieuse, cette chambre double offre une vue agréable et des prestations améliorées pour un séjour parfait.','[\"Wi-Fi gratuit\", \"TV Écran Plat\", \"Climatisation\", \"Mini-bar\", \"Peignoirs\"]','2025-07-31 12:25:21','2025-08-02 13:08:21'),(6,'Chambre Queen Deluxe',135.00,'disponible','Luxe et espace se rencontrent dans notre chambre Queen Deluxe, conçue pour un confort maximal.','[\"Wi-Fi gratuit\", \"TV Écran Plat\", \"Climatisation\", \"Mini-bar\", \"Peignoirs et chaussons\"]','2025-07-31 12:25:21','2025-08-02 13:08:50'),(7,'Chambre King Vue Ville',150.00,'disponible','Un lit King size majestueux et une vue panoramique sur Kolwezi. L\'élégance à son apogée.','[\"Wi-Fi gratuit\", \"TV 55 pouces\", \"Climatisation\", \"Machine à café Nespresso\", \"Vue panoramique\"]','2025-07-31 12:25:21','2025-08-02 13:09:18'),(8,'Chambre King Executive',160.00,'occupée','Conçue pour le voyageur d\'affaires exigeant, avec un grand bureau et un accès au lounge.','[\"Wi-Fi gratuit\", \"TV Écran Plat\", \"Climatisation\", \"Mini-bar\", \"Accès au lounge\"]','2025-07-31 12:25:21','2025-08-02 13:09:45'),(9,'Suite Junior Moderne',180.00,'disponible','Un espace de vie décloisonné avec un coin salon, idéal pour les séjours prolongés ou les petites familles.','[\"Wi-Fi haut débit\", \"TV 55 pouces\", \"Climatisation\", \"Espace salon\", \"Mini-bar complet\"]','2025-07-31 12:25:21','2025-08-02 13:10:17'),(10,'Suite Junior Prestige',200.00,'maintenance','Une suite élégante offrant des prestations de luxe et une attention particulière aux détails.','[\"Wi-Fi haut débit\", \"TV 55 pouces\", \"Climatisation\", \"Espace salon\", \"Peignoirs et chaussons\"]','2025-07-31 12:25:21','2025-08-02 13:10:52'),(11,'Suite Exécutive Panoramique',250.00,'disponible','Avec une chambre séparée et un grand salon, cette suite offre une vue imprenable et un confort absolu.','[\"Wi-Fi haut débit\", \"Deux TV 55 pouces\", \"Climatisation\", \"Salon séparé\", \"Accès au lounge exécutif\"]','2025-07-31 12:25:21','2025-08-02 13:11:14'),(12,'Suite Exécutive avec Terrasse',280.00,'disponible','Le summum du luxe : une suite spacieuse s\'ouvrant sur une terrasse privée aménagée.','[\"Wi-Fi haut débit\", \"TV 65 pouces\", \"Climatisation\", \"Salon séparé\", \"Terrasse privée\"]','2025-07-31 12:25:21','2025-08-02 13:11:39'),(13,'Appartement Familial (2 ch.)',300.00,'disponible','Idéal pour les familles, avec deux chambres séparées, un salon et une kitchenette.','[\"Wi-Fi gratuit\", \"Trois TV\", \"Climatisation\", \"Kitchenette\", \"Salon commun\"]','2025-07-31 12:25:21','2025-08-02 13:12:03'),(14,'Suite Familiale Deluxe',270.00,'disponible','Un grand espace modulable pour accueillir confortablement toute votre famille avec style.','[\"Wi-Fi gratuit\", \"TV Écran Plat\", \"Climatisation\", \"Mini-bar\", \"Canapé-lit\"]','2025-07-31 12:25:21','2025-08-02 13:12:20'),(15,'Suite Présidentielle Mwinda',450.00,'disponible','L\'incarnation du luxe. Un étage entier dédié à votre confort, avec service de majordome.','[\"Wi-Fi dédié\", \"Home cinéma\", \"Climatisation\", \"Salle à manger\", \"Service majordome\"]','2025-07-31 12:25:21','2025-08-02 13:12:37'),(16,'Penthouse Lualaba',420.00,'disponible','Notre penthouse au dernier étage offre une vue à 360° sur la ville, avec des prestations inégalées.','[\"Wi-Fi dédié\", \"TV 75 pouces\", \"Climatisation\", \"Jacuzzi privé\", \"Terrasse sur le toit\"]','2025-07-31 12:25:21','2025-08-02 13:12:55'),(17,'Chambre Simple Confort',45.00,'disponible','Chambre simple et luxieuse pour un sejour de reves.','[\"WIFI-Gratuit\", \"Swimming pool\"]','2025-08-01 04:29:14','2025-08-02 13:13:27');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `role` enum('client','admin') DEFAULT 'client',
  `resetPasswordToken` varchar(255) DEFAULT NULL,
  `resetPasswordExpires` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; -- CORRIGÉ
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Michel Nyembo','michelnyembochungu@gmail.com','$2b$08$bhLFUw0V0TLkeKZr/DPkFu1Mszz0gD6O3ESIMcszLAHo/PymQufw.',NULL,NULL,'admin',NULL,NULL,'2025-07-31 06:38:55','2025-08-01 03:07:17'),(3,'Admin Mwinda','admin@mwinda.com','$2b$08$xBX879VkbLOMbSkp.syRAuB.3880o6RanIwA0/mnrSKkLElbY5b/q',NULL,NULL,'admin',NULL,NULL,'2025-07-31 07:07:21','2025-07-31 07:07:21'),(4,'Michael Nb','michaelnyembo@icloud.com','$2b$08$8sil.KSjUZc6OFB2iwGymekWYkwMOnH8ZkA3sCwF/uNAQEnigMMbW','0997970127','Mafunda Street 713, Dilala, Lualaba, Kolwezi DRC','client',NULL,NULL,'2025-07-31 12:18:57','2025-08-01 13:25:56');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-02 16:12:18