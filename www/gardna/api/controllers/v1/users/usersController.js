/*
	@Creator: BetCoin Developer <betcoin_contact@protonmail.com> 07/04/2022
	@File: users.js
	@Description: Gerenciador de apis vinculadas com os usuários..
	@morgan: intercepta as chamadas ao servidor, pegando dados de acesso do client.
	@body-parser: Parserar dados recebidos.
*/

//Fixme
const express 	= require('express');
const router 	= express.Router();
const bparser 	= require('body-parser');
const morgan 	= require('morgan');
const cors 		= require('cors');
var path 		= require("path");
const consts 	= require(__dirname+"/../../../config/constants.js");
const helper 	= require(__dirname+"/../../../helpers/helper.js");

var modelUsers 		 = require(__dirname+"/../../../models/modelUsers.js");
var modelGame 		 = require(__dirname+"/../../../models/modelGame.js");
const authService 	 = require(__dirname+"/../auth/authenticationController.js");
const sha512 		 = require('js-sha512');

/*
* POST login OK
*/
router.post('/login', helper.requiredFields(['wallet']) ,async(req,res) => {

	modelUsers.authentication(req.body.wallet,  async function(user){

		if(user && !user.errors){ //User exists
			const token = await authService.generateToken({
				id: user.id,
				wallet: req.body.wallet
			});

			modelGame.listGames(user.id,user.balance,function(gameList) {
				res.status(consts.HTTP_OK).send({
					status: consts.statusOK,
					msg: "Login Authorized!",
					data: {
						id: user.id,
						need_password: user.need_password,
						balance: user.balance,
						token: token,
						pendences: user.pendences,
						games: gameList.games,
						rooms: gameList.rooms
					}
				});
			});

		} else {

			var errorsFilter = [];

			helper.errorsArray(user.errors,function(filter){
				errorsFilter = filter;
			});

			res.status(consts.HTTP_NOT_FOUND).send({
				status: consts.statusFalse,
				msg: "Account banned!",
				errors: errorsFilter
			});

		}


	});

	
});


/*
* PUT Add Password
*/
router.put('/addPassword', helper.requiredFields(['newPassword']),async(req,res) => {

	await authService.decodeToken(req,res, async function(data) {

		modelUsers.addPassword(data.id, req.body.newPassword,  async function(user){

			if(user && !user.errors){

				res.status(consts.HTTP_OK).send({
					status: consts.statusOK,
					msg: "Add password success!"
				});

			} else {

				var errorsFilter = [];

				helper.errorsArray(user.errors,function(filter){
					errorsFilter = filter;
				});

				res.status(consts.HTTP_NOT_FOUND).send({
					status: consts.statusFalse,
					msg: "Add password fail!",
					errors: errorsFilter
				});
				
			}

		});

	});
	
});

/*
* PUT Add Password
*/
router.put('/updatePassword', helper.requiredFields(['oldPassword','newPassword']),async(req,res) => {

	await authService.decodeToken(req,res, async function(data) {

		modelUsers.updatePassword(data.id,req.body.oldPassword, req.body.newPassword,  async function(user){

			if(user && !user.errors){

				res.status(consts.HTTP_OK).send({
					status: consts.statusOK,
					msg: "Change password success!"
				});

			} else {

				if(!user) {

					res.status(consts.HTTP_NOT_FOUND).send({
						status: consts.statusFalse,
						msg: "User not found!"
					});

				} else {
					var errorsFilter = [];

					helper.errorsArray(user.errors,function(filter){
						errorsFilter = filter;
					});

					res.status(consts.HTTP_NOT_FOUND).send({
						status: consts.statusFalse,
						msg: "Add password fail!",
						errors: errorsFilter
					});
				}
				

			}

		});

	});
	
});

/*
* POST Confirm Password
*/
router.post('/confirmPassword', helper.requiredFields(['password']),async(req,res) => {

	await authService.decodeToken(req,res, async function(data) {

		modelUsers.confirmPassword(data.id,req.body.password, async function(user){

			if(user && !user.errors) {

				res.status(consts.HTTP_OK).send({
					status: consts.statusOK,
					msg: "Success!"
				});

			} else {

				res.status(consts.HTTP_NOT_FOUND).send({
					status: consts.statusFalse,
					msg: "Access denied."
				});

			}

		});

	});

});

module.exports = router;