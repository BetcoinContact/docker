/*
	@Creator: BetCoin Developer <betcoin_contact@protonmail.com> 07/04/2022
	@File: modelTransaction.js
	@Description: Model Transactions Sequelize
	*/

	const db 		= require(__dirname+"/../config/database.js");	
	const helper	= require(__dirname+"/../helpers/helper.js");
	const sha512	= require('js-sha512');

/****************************************************************************************************************
* Model
****************************************************************************************************************/

/****************
* Transaction Status
*****************/
const TransactionStatus = db.connection.sequelize.define('Tbl_Transactions_Status', {
	Transaction_Status_ID: {
		type: db.connection.DataTypes.INTEGER,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
	},
	Transaction_Status: {
		type: db.connection.DataTypes.STRING,
		allowNull: false,
		unique: {
			args: true,
			msg: 'Transaction status already registered.'
		},
		validate: {
			notEmpty: {msg: "The Transaction status is required."},
			notNull: {msg: "The Transaction status is required."},
			len: {
				args: [66],
				msg: "Invalid Transaction status."
			}
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

}, {
	freezeTableName: true, //Disable Plural
});

/****************
* Transaction Type
*****************/
const TransactionType = db.connection.sequelize.define('Tbl_Transactions_Types', {
	Transaction_Type_ID: {
		type: db.connection.DataTypes.INTEGER,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
	},
	Transaction_Type: {
		type: db.connection.DataTypes.STRING,
		allowNull: false,
		unique: {
			args: true,
			msg: 'Transaction type already registered.'
		},
		validate: {
			notEmpty: {msg: "The Transaction type is required."},
			notNull: {msg: "The Transaction type is required."},
			len: {
				args: [66],
				msg: "Invalid Transaction type."
			}
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

/****************
* Transaction
*****************/
const Transaction = db.connection.sequelize.define('Tbl_Transactions', {
	Transaction_ID: {
		type: db.connection.DataTypes.INTEGER,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
	},
	Transaction_Hash: {
		type: db.connection.DataTypes.STRING,
		allowNull: false,
		unique: {
			args: true,
			msg: 'Transaction already registered.'
		},
		validate: {
			notEmpty: {msg: "The Transaction is required."},
			notNull: {msg: "The Transaction is required."},
			len: {
				args: [66],
				msg: "Invalid Transaction."
			}
		}
	},
	Transaction_Status_FK: {
		type: db.connection.DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	Transaction_FK: {
		type: db.connection.DataTypes.INTEGER,
		allowNull: true
	},
	Transaction_Value: {
		type: db.connection.DataTypes.INTEGER,
		allowNull: false
	}, 
	Transaction_Type_FK: {
		type: db.connection.DataTypes.INTEGER,
		allowNull: false
	}, 
	User_FK: {
		type: db.connection.DataTypes.INTEGER,
		allowNull: false
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
* Transaction Associates
*/
Transaction.associate = function(models) {
  Transaction.belongsTo(models.TransactionStatus, { 
      foreignKey : "Transaction_Status_FK",
      sourceKey : 'Transaction_Status_ID' 
  });
}

Transaction.belongsTo(TransactionStatus, {
    foreignKey: 'Transaction_Status_FK'
});

Transaction.associate = function(models) {
  Transaction.belongsTo(models.TransactionType, { 
      foreignKey : "Transaction_Type_FK",
      sourceKey : 'Transaction_Type_ID' 
  });
}

Transaction.belongsTo(TransactionType, {
    foreignKey: 'Transaction_Type_FK'
});

/****************************************************************************************************************
* Functions
****************************************************************************************************************/

/*
* New Transaction
*/
var newTransaction = async function newTransaction(id,hash,type,value,fk, callback){

	helper.acceptFields(['Transaction_Hash','Transaction_Value','Transaction_Type_FK','Transaction_FK','User_FK'] ,
		{'Transaction_Hash': hash,'Transaction_Value': value,'Transaction_Type_FK': type,'Transaction_FK': fk, 'User_FK': id},
			function(transactionFilter) {
		transactionObj = transactionFilter;
	});

	await Transaction.create(transactionObj)
	.then(newTransaction => {
		callback(newTransaction);
	})
	.catch(function(error){
		callback(error);	
	});

}

/*
* Update Transaction
*/
var statusTransaction = async function statusTransaction(hash,status, callback){

	helper.acceptFields(['Transaction_Status_FK'] ,{'Transaction_Status_FK': status}, function(transactionFilter) {
		transactionObj = transactionFilter;
	});

	await Transaction.update(transactionObj,{
		where: { Transaction_Hash: hash }
	})
	.then(transaction => {
		if(transaction[0] == 1) {
			callback(transaction);
		} else {
			room.errors = [
				{"message":"Transaction not found or is already in this status!"}
			]
			callback(room);
		}
	})
	.catch(function(error){
		callback(error);	
	});

}

/*
* List Transactions
*/
var listTransaction = async function listTransaction(id, callback){

	var sequelize = db.connection.sequelize;

	Transaction.findAll({
		raw: true,
		attributes: [
			['Transaction_ID','id'],
			['Transaction_Hash','hash'],
			['Transaction_Value','value'],
			[sequelize.col('Tbl_Transactions_Status.Transaction_Status_ID'), 'statusID'],
			[sequelize.col('Tbl_Transactions_Status.Transaction_Status'), 'status'],
			[sequelize.col('Tbl_Transactions_Type.Transaction_Type_ID'), 'typeID'],
			[sequelize.col('Tbl_Transactions_Type.Transaction_Type'), 'type'],
			[sequelize.fn('date_format', sequelize.col('Tbl_Transactions.created_at'),'%m-%d-%Y %H:%i:%s'), 'createdAt'],
			[sequelize.fn('date_format', sequelize.col('Tbl_Transactions.updated_at'),'%m-%d-%Y %H:%i:%s'), 'updatedAt']
		],
		include: [ 
			{
				model: TransactionStatus,
				require: true,
				attributes: []
			},
			{
				model: TransactionType,
				require: true,
				attributes: []
			}
		],
		where: {
			User_FK: id
		}
	}).then(transactionList => {
		callback(transactionList);
	})
	.catch(function(error){
		callback(error);	
	});

}

/*
* List Transactions pendents
*/
var listTransactionPendents = async function listTransactionPendents(id, callback){

	var sequelize = db.connection.Sequelize;

	Transaction.findAll({
		raw: true,
		attributes: [
			['Transaction_ID','id'],
			['Transaction_Hash','hash'],
		],
		where: {
			User_FK: id,
			Transaction_Status_FK: 1,
			[sequelize.Op.or]: [
					{Transaction_Type_FK: 1},
					{Transaction_Type_FK: 2}
			],
		}
	}).then(transactionList => {
		callback(transactionList);
	})
	.catch(function(error){
		callback(error);	
	});

}

/*
* Balance Of
*/
var balanceOf = async function balanceOf(id, callback){
	var sequelize = db.connection.sequelize;
	Transaction.findAll({
	  attributes: [
	  	sequelize.literal('sum(Transaction_Value) as balance')
	  ],
	  where: {
			User_FK: id,
			Transaction_Status_FK : 2
		},
	  raw: true
	}).then(balance => {
		balance = balance[0].balance ? balance[0].balance : 0;
		callback(parseInt(balance));
	})
	.catch(function(error){
		callback(0);	
	});
}

/*
* New Transaction End Game
*/
var endGameTransaction = async function endGameTransaction(p1,p2,winner,room,value){

	var homeHash = "PLAYER_"+p1+"_h_PLAYER_"+p2+"_ROOM_"+room+"_";
	var p1Hash = "PLAYER_"+p1+"_x_PLAYER_"+p2+"_ROOM_"+room+"_";
	var p2Hash = "PLAYER_"+p2+"_x_PLAYER_"+p1+"_ROOM_"+room+"_";
	const diff = 66 - p1Hash.length;

	helper.makeHash(diff,function(hash_) {
		homeHash += hash_;
		p1Hash += hash_;
		p2Hash += hash_;
	});

	var valueHome = value * 0.1; //10%
	var valueWinner = value * 0.8; //80%
	var valueLoser = - (value - valueHome); //-90% (10% Cashback)

	var home = {
		Transaction_Hash: homeHash,
		Transaction_Status_FK: 2,
		Transaction_Value: valueHome,
		Transaction_Type_FK: 3,
		User_FK: 1 //Pool Address
	};

	var p1Obj = {
		Transaction_Hash: p1Hash,
		Transaction_Status_FK: 2,
		Transaction_Value: p1 == winner ? valueWinner : valueLoser,
		Transaction_Type_FK: p1 == winner ? 3 : 4,
		User_FK: p1
	};

	var p2Obj = {
		Transaction_Hash: p2Hash,
		Transaction_Status_FK: 2,
		Transaction_Value: p2 == winner ? valueWinner : valueLoser,
		Transaction_Type_FK: p2 == winner ? 3 : 4,
		User_FK: p2
	};

	await Transaction.create(home);
	await Transaction.create(p1Obj);
	await Transaction.create(p2Obj);

}

/****************************************************************************************
* Exports
*/
module.exports = {

	newTransaction: newTransaction,
	listTransaction: listTransaction,
	listTransactionPendents: listTransactionPendents,
	statusTransaction: statusTransaction,
	balanceOf: balanceOf,
	endGameTransaction: endGameTransaction

}



