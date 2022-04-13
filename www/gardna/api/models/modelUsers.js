/*
	@Creator: BetCoin Developer <betcoin_contact@protonmail.com> 07/04/2022
	@File: modelUsers.js
	@Description: Model Users Sequelize
	*/

	const db 		= require(__dirname+"/../config/database.js");	
	const helper	= require(__dirname+"/../helpers/helper.js");
	const transactionModel	= require(__dirname+"/modelTransaction.js");
	const sha512	= require('js-sha512');

/****************************************************************************************************************
* Model
****************************************************************************************************************/
const User = db.connection.sequelize.define('Tbl_User_Accounts', {
		User_ID: {
			type: db.connection.DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		User_Wallet: {
			type: db.connection.DataTypes.STRING,
			allowNull: false,
			unique: {
				args: true,
				msg: 'Wallet already registered.'
			},
			validate: {
				notEmpty: {msg: "The wallet is required."},
				notNull: {msg: "The wallet is required."},
				len: {
					args: [42],
					msg: "Invalid wallet."
				}
			}
		},
		User_Password: {
			type: db.connection.DataTypes.STRING,
			allowNull: true,
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
	},{
		hooks: {
			afterValidate:function(user, options, cb) {
				// if(user.User_Password){
				// 	user.User_Password = sha512(user.User_Password);
				// }
		  	},
			beforeCreate:function(user, options, cb) {},
			beforeBulkUpdate:function(user, options, cb) {}
		}
	}
);


/****************************************************************************************************************
* Functions
****************************************************************************************************************/

/*
* Login
*/
var authentication =  function authentication(userWallet,callback){

	var sequelize = db.connection.Sequelize;

	User.findOrCreate({
		attributes: [
			'User_ID',
			['created_at','create'],
			['updated_at','updated'],
			'User_Password'
		],
		where: {
			User_Wallet: userWallet,
			Deleted_at: null
		}
	}).then(user => {
		userObj = {
			id: user[0].User_ID,
			need_password: user[0].User_Password != null
		};
		transactionModel.balanceOf(userObj.id, function (balance){
			userObj["balance"] = balance;
			transactionModel.listTransactionPendents(userObj.id, function (pendences){
				userObj["pendences"] = pendences;
				callback(userObj);
			});
		});
	})
	.catch(function(error){
		callback(error);	
	});

}

/*
* Confirm Password
*/
var confirmPassword = async function confirmPassword(id,password,callback) {

	User.findOne({
		attributes: ['User_ID',['created_at','create'],['updated_at','updated']],
		where: {
			User_ID: id,
			User_Password: password,
			Deleted_at: null
		}
	}).then(user => {
		callback(user);
	})
	.catch(function(error){
		callback(error);	
	});

}

/*
* Add Password
*/
var addPassword = async function addPassword(id,newPassword,callback){

	helper.acceptFields(['User_Password'] ,{'User_Password': newPassword},function(userFilter) {
		user = userFilter;
	});

	await User.update(user,{
		where: {
			User_ID: id,
			User_Password: null,
			Deleted_at: null
		}
	})
	.then(updateUser => {
		if(updateUser[0] == 1) {
			callback(updateUser);
		} else {
			updateUser.errors = [
				{"message":"User not found or password already set!"}
			]
			callback(updateUser);
		}
	})
	.catch(function(error){
		callback(error);	
	});

}

/*
* Update Password
*/
var updatePassword = async function updatePassword(id,currentPassword,newPassword,callback){

	if(currentPassword == newPassword) {
		error = [];
		error.errors = [
			{"message":"Passwords must be different."}
		]
		callback(error);
	} else {

		this.confirmPassword(id,currentPassword, async function(findUser) {
			if(findUser && !findUser.errors) {
				helper.acceptFields(['User_Password'] ,{'User_Password': newPassword},function(userFilter) {
					user = userFilter;
				});

				await User.update(user,{
					where: {
						User_ID: id,
						User_Password: currentPassword,
						Deleted_at: null
					}
				})
				.then(updateUser => {
					if(updateUser[0] == 1) {
						callback(updateUser);
					} else {
						updateUser.errors = [
							{"message":"User not found or banned!"}
						]
						callback(updateUser);
					}
				})
				.catch(function(error){
					callback(error);	
				});
			} else {

				if(!findUser) { 
					findUser = []; 
					findUser.errors = [
						{"message":"User not found or banned!"}
					];
					callback(findUser);
				} else {
					if(!findUser.errors && findUser[0] == 1) {
						callback(updateUser);
					} else {
						if(findUser[0] == 0) {
							findUser.errors = [
								{"message":"User not found or banned!"}
							];
							callback(findUser);
						} else if (findUser.errors) {
							callback(findUser);
						}
						
					}
				}

			}

		});

	}

}



/****************************************************************************************
* Exports
*/
module.exports = {

	authentication: authentication,
	addPassword: addPassword,
	updatePassword: updatePassword,
	confirmPassword: confirmPassword

}