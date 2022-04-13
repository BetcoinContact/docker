DROP DATABASE IF EXISTS DB_BetCoin;

CREATE SCHEMA DB_BetCoin CHARACTER SET utf8 COLLATE utf8_general_ci;
use DB_BetCoin;

/*
* List Status of transactions
*/
CREATE TABLE Tbl_Transactions_Status (

	Transaction_Status_ID int(11) NOT NULL AUTO_INCREMENT,
	Transaction_Status text NOT NULL COMMENT 'Transaction Status',

	Created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	Updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	Deleted_at timestamp NULL DEFAULT NULL,

	PRIMARY KEY (Transaction_Status_ID)

);

INSERT INTO Tbl_Transactions_Status
		(Transaction_Status_ID,Transaction_Status)
	VALUES
		(1,"pending"),
		(2,"success"),
        (3,"fail");

/*
* List Types of transactions
*/
CREATE TABLE Tbl_Transactions_Types (

	Transaction_Type_ID int(11) NOT NULL AUTO_INCREMENT,
	Transaction_Type text NOT NULL COMMENT 'Transaction Type',

	Created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	Updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	Deleted_at timestamp NULL DEFAULT NULL,

	PRIMARY KEY (Transaction_Type_ID)

);

/*
	1,3 = +
	2,4 = -
	5 = +/-
*/
INSERT INTO Tbl_Transactions_Types
		(Transaction_Type_ID,Transaction_Type)
	VALUES
		(1,"buy credit"),
		(2,"sell credit"),
		(3,"winner"),
		(4,"loser"),
		(5,"rollback");


/*
* List Games
*/
CREATE TABLE Tbl_Games (

	Game_ID int(11) NOT NULL AUTO_INCREMENT,
	Game_Name text NOT NULL COMMENT 'Game name',

	Created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	Updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	Deleted_at timestamp NULL DEFAULT NULL,

	PRIMARY KEY (Game_ID)

);

INSERT INTO Tbl_Games
		(Game_ID,Game_Name)
	VALUES
		(1,"Game 1"),
		(2,"Game 2"),
        (3,"Game 3"),
        (4,"Game 4"),
        (5,"Game 5");

/*
* Account User
*/

CREATE TABLE Tbl_User_Accounts (

	User_ID int(11) NOT NULL AUTO_INCREMENT,
	User_Wallet varchar(42) NOT NULL COMMENT 'Wallet address',
	User_Password varchar(128) NULL COMMENT 'Optional, for withdrawal',

	Created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	Updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	Deleted_at timestamp NULL DEFAULT NULL,

	PRIMARY KEY (User_ID),
	UNIQUE(User_Wallet)

);

/*
* List Rooms
*/
CREATE TABLE Tbl_Rooms (

	Room_ID int(11) NOT NULL AUTO_INCREMENT,
	Room_Public boolean NOT NULL default false COMMENT 'Room is public?',
	Room_Game_Fk int(11) NOT NULL COMMENT 'Fk Game.',
	Room_Ip text NOT NULL COMMENT 'Ip server',
	Room_Value int(11) NOT NULL COMMENT 'bet amount',
	Room_Created_by int(11) NOT NULL COMMENT 'Fk User Account create room.',
	Room_Challenger int(11) NULL COMMENT 'Fk User Account challenger.',
	Room_Winner boolean NULL default null COMMENT 'Creator Won?',

	Created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	Updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	Closed_at timestamp NULL DEFAULT NULL,
	Deleted_at timestamp NULL DEFAULT NULL,

	PRIMARY KEY (Room_ID),
	CONSTRAINT Tbl_Rooms_x_Tbl_Games FOREIGN KEY (Room_Game_Fk) REFERENCES Tbl_Games (Game_ID),
	CONSTRAINT Tbl_Rooms_Created_By_x_Tbl_User_Accounts FOREIGN KEY (Room_Created_by) REFERENCES Tbl_User_Accounts (User_ID),
	CONSTRAINT Tbl_Rooms_Challenger_x_Tbl_User_Accounts FOREIGN KEY (Room_Challenger) REFERENCES Tbl_User_Accounts (User_ID)

);

/*
* Transaction historic
*/

CREATE TABLE Tbl_Transactions (

	Transaction_ID int(11) NOT NULL AUTO_INCREMENT,
	Transaction_Hash varchar(66) NOT NULL COMMENT 'Transaction hash',
	Transaction_Value int NOT NULL COMMENT 'Transaction Value',
	Transaction_Status_FK int(11) NULL DEFAULT 1 COMMENT 'Transaction Status',
	Transaction_Type_FK int(11) NOT NULL COMMENT 'Transaction Type',
	Transaction_FK int(11) NULL COMMENT 'Only Rollback',
	User_FK int(11) NOT NULL COMMENT 'User Account',

	Created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	Updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

	PRIMARY KEY (Transaction_ID),
	UNIQUE(Transaction_Hash),
	CONSTRAINT Tbl_Transactions_x_Tbl_Transactions_Types FOREIGN KEY (Transaction_Type_FK) REFERENCES Tbl_Transactions_Types (Transaction_Type_ID),
	CONSTRAINT Tbl_Transactions_x_Tbl_Transactions_Status FOREIGN KEY (Transaction_Status_FK) REFERENCES Tbl_Transactions_Status (Transaction_Status_ID),
	CONSTRAINT Tbl_Transactions_x_Tbl_User_Accounts FOREIGN KEY (User_FK) REFERENCES Tbl_User_Accounts (User_ID)

);