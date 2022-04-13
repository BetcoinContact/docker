/*
	@Creator: BetCoin Developer <betcoin_contact@protonmail.com> 07/04/2022
	@File: gameController.js
	@Description: Gerenciador de apis vinculadas com as transações..
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

var modelGame = require(__dirname+"/../../../models/modelGame.js");
const authService 	 = require(__dirname+"/../auth/authenticationController.js");
const sha512 		 = require('js-sha512');
var request = require('request');
const usingBscValidation = true;

/*
* POST Create Room
*/
router.post('/newRoom',  helper.requiredFields(['isPublic','game','ip','value']) ,async(req,res) => {

	await authService.decodeToken(req,res, async function(data) {

		modelGame.newRoom(data.id, req.body.isPublic ,req.body.game ,req.body.ip ,req.body.value , async function(room){

			if(room && !room.errors) {

				res.status(consts.HTTP_OK).send({
					status: consts.statusOK,
					msg: "Room created.",
					data: room
				});

			} else {

				var errorsFilter = [];

				helper.errorsArray(room.errors,function(filter){
					errorsFilter = filter;
				});

				res.status(consts.HTTP_NOT_FOUND).send({
					status: consts.statusFalse,
					msg: "Error: create room fail!",
					errors: errorsFilter
				});

			}

		});

	});

});

/*
* PUT Create Room
*/
router.put('/closeRoom',  helper.requiredFields(['id', 'wid']) ,async(req,res) => {

	await authService.decodeToken(req,res, async function(data) {

		modelGame.closeRoom(data.id, req.body.id, req.body.wid, async function(room){

			if(room && !room.errors) {

				res.status(consts.HTTP_OK).send({
					status: consts.statusOK,
					msg: "Room closed success."
				});

			} else {

				var errorsFilter = [];

				helper.errorsArray(room.errors,function(filter){
					errorsFilter = filter;
				});

				res.status(consts.HTTP_NOT_FOUND).send({
					status: consts.statusFalse,
					msg: "Error: close room fail!",
					errors: errorsFilter
				});
			}

		});

	});

});

/*
* PUT Enter Room
*/
router.put('/enterRoom',  helper.requiredFields(['id']) ,async(req,res) => {

	await authService.decodeToken(req,res, async function(data) {

		modelGame.enterRoom(data.id, req.body.id, async function(room){

			if(room && !room.errors) {

				res.status(consts.HTTP_OK).send({
					status: consts.statusOK,
					msg: "Room enter success.",
					data: room
				});

			} else {

				var errorsFilter = [];

				helper.errorsArray(room.errors,function(filter){
					errorsFilter = filter;
				});

				res.status(consts.HTTP_NOT_FOUND).send({
					status: consts.statusFalse,
					msg: "Error: enter room fail!",
					errors: errorsFilter
				});

			}

		});

	});

});

module.exports = router;