/*
	@Creator: BetCoin Developer <betcoin_contact@protonmail.com> 07/04/2022
	@File: transactionController.js
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

var modelTransaction = require(__dirname+"/../../../models/modelTransaction.js");
const authService 	 = require(__dirname+"/../auth/authenticationController.js");
const sha512 		 = require('js-sha512');
var request = require('request');
const usingBscValidation = true;

/*
* GET List Transaction
*/
router.get('/list', async(req,res) => {

	await authService.decodeToken(req,res, async function(data) {
		
		modelTransaction.listTransaction(data.id, async function(transactionList){

			if(transactionList && !transactionList.errors) {

				res.status(consts.HTTP_OK).send({
					status: consts.statusOK,
					msg: "Transaction List",
					data: transactionList
				});

			} else {

				var errorsFilter = [];

				helper.errorsArray(transactionList.errors,function(filter){
					errorsFilter = filter;
				});

				res.status(consts.HTTP_NOT_FOUND).send({
					status: consts.statusFalse,
					msg: "Error: list transactionList fail!",
					errors: errorsFilter
				});

			}

		});

	});

});

/*
* POST Create Transaction
*/
router.post('/create', helper.requiredFields(['hash','type','value']) ,async(req,res) => {
	
	await authService.decodeToken(req,res, async function(data) {

		modelTransaction.newTransaction(data.id, req.body.hash, req.body.type, req.body.value, req.body.fk,  async function(transaction){

			if(transaction && !transaction.errors) {

				res.status(consts.HTTP_OK).send({
					status: consts.statusOK,
					msg: "Create new transaction with success!",
					data: {
						id: transaction.Transaction_ID
					}
				});

			} else {

				var errorsFilter = [];

				helper.errorsArray(transaction.errors,function(filter){
					errorsFilter = filter;
				});

				res.status(consts.HTTP_NOT_FOUND).send({
					status: consts.statusFalse,
					msg: "Error: create transaction fail!",
					errors: errorsFilter
				});

			}

		});		

	});

});

/*
* PUT Update Status Transaction
*/
router.put('/update', helper.requiredFields(['hash','status']) ,async(req,res) => {
	
	await authService.decodeToken(req,res, async function(data) {

		if(usingBscValidation && req.body.status == 2) {
			confirmTransaction(req.body.hash, req.body.status, function(data) {
				if(data.result.status == "1") {
					updateTransaction(req, res);
				} else {
					res.status(consts.HTTP_UNAUTHORIZED).send({
						status: consts.statusFalse,
						msg: "Status invalid"
					});
				}
			})
		} else {
			updateTransaction(req, res);
		}

	});

});

function updateTransaction(req,res) {

	modelTransaction.statusTransaction(req.body.hash, req.body.status, async function(transaction){

		if(transaction && !transaction.errors) {

			res.status(consts.HTTP_OK).send({
				status: consts.statusOK,
				msg: "Status updated with success!"
			});

		} else {

			var errorsFilter = [];

			helper.errorsArray(transaction.errors,function(filter){
				errorsFilter = filter;
			});

			res.status(consts.HTTP_NOT_FOUND).send({
				status: consts.statusFalse,
				msg: "Error: update status transaction fail!",
				errors: errorsFilter
			});

		}

	});

}

//Todo create apilayer
function confirmTransaction(hash,status, callback) {
	var options = {
	  'method': 'GET',
	  'url': 'https://api.bscscan.com/api?module=transaction&action=gettxreceiptstatus&txhash='+hash+'&apikey='+process.env.BSC_API_TOKEN,
	  'headers': {
	  }
	};
	request(options, function (error, response) {
	  if (error) throw new Error(error);
	  callback(JSON.parse(response.body));
	});
}

module.exports = router;