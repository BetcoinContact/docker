/*
	@Creator: BetCoin Developer <betcoin_contact@protonmail.com> 07/04/2022
	@File: database.js
	@Description: Data base connection
*/

if(process.env.SEQUELIZE) {

	const { Sequelize, DataTypes } = require('sequelize');

	const sequelize = new Sequelize(process.env.MYSQL_SCHEMA, process.env.MYSQL_USER, process.env.MYSQL_PASS, {
		host: process.env.MYSQL_HOST,
		port: process.env.MYSQL_PORT,
		dialect: 'mysql',
		logging: process.env.NODE_ENV != 'production',
		logging: false,
		define: {
			timestamps: false
		},	
		pool: {
			max: 30,
			min: 0,
			acquire: 30000,
			idle: 10000
		}
	});

	const db = {};
			db.Sequelize = Sequelize;
			db.sequelize = sequelize;
			db.DataTypes = DataTypes;
			module.exports = { connection : db };

} else {

	const mysql = require('mysql');

	const connection = mysql.createConnection({

		//debug 		: process.env.NODE_ENV != 'production',
		host 		: process.env.MYSQL_HOST,
		port 		: process.env.MYSQL_PORT,
		user 		: process.env.MYSQL_USER,
		password 	: process.env.MYSQL_PASS,
		database 	: process.env.MYSQL_SCHEMA

	});

	if(!connection._connectCalled) {
		
		connection.connect(function(err) {
		  if (err) {
		    console.error('Error connecting: ' + err.stack);
		    return;
		  }
		 
		  console.log('Connected as id ' + connection.threadId);
		  module.exports = { connection : connection };
		});

	}

}