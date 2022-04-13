/*
	@Creator: BetCoin Developer <betcoin_contact@protonmail.com> 07/04/2022
	@File: modelGame.js
	@Description: Model Games Sequelize
	*/

	const db 		= require(__dirname+"/../config/database.js");	
	const helper	= require(__dirname+"/../helpers/helper.js");
	const transactionModel	= require(__dirname+"/modelTransaction.js");
	const sha512	= require('js-sha512');

/****************************************************************************************************************
* Model
****************************************************************************************************************/
const Games = db.connection.sequelize.define('Tbl_Games', {
	Game_ID: {
		type: db.connection.DataTypes.INTEGER,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
	},
	Game_Name: {
		type: db.connection.DataTypes.STRING,
		allowNull: false,
		unique: {
			args: true,
			msg: 'Game already registered.'
		},
		validate: {
			notEmpty: {msg: "The Game is required."},
			notNull: {msg: "The Game is required."}
		}
	},
	Deleted_at: {
		type: db.connection.DataTypes.DATE,
		allowNull: true
	},
	created_at: {
		type: db.connection.DataTypes.DATE,
		allowNull: true
	},
	updated_at: {
		type: db.connection.DataTypes.DATE,
		allowNull: true
	}

});

const Rooms = db.connection.sequelize.define('Tbl_Rooms', {
	Room_ID: {
		type: db.connection.DataTypes.INTEGER,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
	},
	Room_Public: {
		type: db.connection.DataTypes.BOOLEAN,
		allowNull: false
	},
	Room_Game_Fk: {
		type: db.connection.DataTypes.INTEGER,
		allowNull: false
	},
	Room_Ip: {
		type: db.connection.DataTypes.STRING,
		allowNull: false,
		validate: {
			notEmpty: {msg: "The IP is required."},
			notNull: {msg: "The IP is required."}
		}
	},
	Room_Value: {
		type: db.connection.DataTypes.INTEGER,
		allowNull: false
	},
	Room_Created_by: {
		type: db.connection.DataTypes.INTEGER,
		allowNull: false
	},
	Room_Challenger: {
		type: db.connection.DataTypes.INTEGER,
		allowNull: true
	},
	Room_Winner: {
		type: db.connection.DataTypes.INTEGER,
		allowNull: true
	},
	Closed_at: {
		type: db.connection.DataTypes.DATE,
		allowNull: true
	},
	Deleted_at: {
		type: db.connection.DataTypes.DATE,
		allowNull: true
	},
	created_at: {
		type: db.connection.DataTypes.DATE,
		allowNull: true
	},
	updated_at: {
		type: db.connection.DataTypes.DATE,
		allowNull: true
	}

});

/*
* Game Associates
*/
Games.associate = function(models) {
  Games.belongsTo(models.Rooms, { 
      foreignKey : "Room_Game_Fk",
      sourceKey : 'Game_ID' 
  });
}

Games.belongsTo(Rooms, {
    foreignKey: 'Room_Game_Fk'
});

/****************************************************************************************************************
* Functions
****************************************************************************************************************/

/*
* New Game room
*/
var newRoom = async function newRoom(id, isPublic,game,ip,value, callback){

	var sequelize = db.connection.sequelize;

	helper.acceptFields(['Room_Created_by','Room_Public','Room_Game_Fk','Room_Ip','Room_Value'] ,
		{'Room_Created_by': id,'Room_Public': isPublic,'Room_Game_Fk': game,'Room_Ip': ip, 'Room_Value': value},
			function(RoomFilter) {
		RoomObj = RoomFilter;
	});

	await Rooms.update({'Deleted_at': sequelize.fn('NOW')},{
		where: { Room_Created_by: id, Deleted_at: null, Closed_at: null }
	});

	await Rooms.create(RoomObj)
	.then(newRoom => {
		callback({id: newRoom.Room_ID});
	})
	.catch(function(error){
		callback({errors: error});	
	});

};

/*
* Close Game room
*/
var closeRoom = async function closeRoom(User_ID, Room_ID, Room_Winner, callback){

	var sequelize = db.connection.Sequelize;
	await Rooms.update({'Closed_at': sequelize.fn('NOW'), 'Room_Winner': Room_Winner},{
		where: {
			Room_ID: Room_ID,
			//Closed_at: null,
			Deleted_at: null,
			//Room_Winner: null,
			[sequelize.Op.or]: [
	      { Room_Created_by: User_ID },
	      { Room_Challenger: User_ID }
		  ]
		}
	})
	.then(close => {

		if(close[0] == 1) {
			
			Rooms.findOne({
				attributes: ['Room_Created_by','Room_Challenger','Room_Winner','Room_ID','Room_Value'],
				where: {
					Room_ID: Room_ID
				}
			}).then(room => {
				transactionModel.endGameTransaction(room.Room_Created_by,room.Room_Challenger,room.Room_Winner,room.Room_ID,room.Room_Value);
				callback(close);
			})
			.catch(function(error){
				callback(error);	
			});
			
		} else {
			var room = {
				errors: [{"message":"Room not found or is already closed!"}]
			}
			callback(room);
		}
	})
	.catch(function(error){
		callback(error);	
	});

};

/*
* Enter Game room
*/
var enterRoom = async function enterRoom(User_ID, IDorIP, callback){

	var sequelize = db.connection.Sequelize;

	helper.acceptFields(['Room_Challenger'] , {'Room_Challenger': User_ID}, function(RoomFilter) {
		RoomObj = RoomFilter;
	});

	transactionModel.balanceOf(User_ID, async function(balance) {

		await Rooms.update(RoomObj,{
			where: {
				[sequelize.Op.or]: [
					{Room_ID: IDorIP},
					{Room_Ip: IDorIP}
				],
				Closed_at: null,
				Deleted_at: null,
				Room_Challenger: null,
				Room_Winner: null,
				Room_value: { [sequelize.Op.lte]: balance },
				Room_Created_by: {
			    [sequelize.Op.ne]: RoomObj.Room_Challenger
			  }
			}
		})
		.then(room => {
			if(room[0] == 1) {
				callback(room);
			} else {
				room.errors = [
					//{"message":"user is in another open room"}
					{"message":"Error when trying to enter the room or insufficient balance."},
				]
				callback(room);
			}
		})
		.catch(function(error){
			callback(error);	
		});

	});
	

};

/*
* List games
*/
var listGames = async function listGames(id,balance,callback){

	var sequelize = db.connection.Sequelize;

	Games.findAll({
		raw: true,
		attributes: [
			['Game_ID','id'],
			['Game_Name','name'],
		],
		where: {
			Deleted_at: null
		}
	}).then(gameList => {
	
		Rooms.findAll({
			raw: true,
			attributes: [
				['Room_ID','id'],
				['Room_Game_Fk','game'],
				['Room_Ip','ip'],
				['Room_Value','value']
			],
			where: {
				Deleted_at: null,
				Closed_at: null,
				Room_Challenger: null,
				Room_Created_by: { [sequelize.Op.ne]: id },
				//Room_value: { [sequelize.Op.lte]: balance },
				Room_Public: true
			}
		}).then(roomList => {
			var list = {
				games: gameList,
				rooms: roomList
			}
			callback(list);
		})
		.catch(function(error){
			callback(error);	
		});

	})
	.catch(function(error){
		callback(error);	
	});
}

/****************************************************************************************
* Exports
*/
module.exports = {

	newRoom: newRoom,
	closeRoom: closeRoom,
	enterRoom: enterRoom,
	listGames: listGames

}