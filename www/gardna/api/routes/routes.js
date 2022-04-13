/*
	@Creator: BetCoin Developer <betcoin_contact@protonmail.com> 07/04/2022
	@File: server.js
	@Description: Responsável por chamar o sistema de rotas.
*/

module.exports = function(app) {
	
	const version   	= "/v1";
	const consts 		= require(__dirname+"/../config/constants.js");
	const helper 		= require(__dirname+"/../helpers/security.js");
	
	/*
	* Home
	*/
	app.get(version, (req,res) => {
		res.status(consts.HTTP_OK).send({
			status: true,
			msg: "Node Express API: "+process.env.PROJECT_NAME,
			data: {
				current_version: process.env.SERVER_VERS
			}
		});
	});


	// ROUTES
	// ==============================================

	/*
	* Users
	*/
	app.use("/"+process.env.PROJECT_NAME+version+'/user', helper.apiToken , require('../controllers'+version+'/users/usersController.js'));
	
	/*
	* Transaction
	*/
	app.use("/"+process.env.PROJECT_NAME+version+'/transaction', helper.apiToken , require('../controllers'+version+'/transaction/transactionController.js'));

	/*
	* Games
	*/
	app.use("/"+process.env.PROJECT_NAME+version+'/game', helper.apiToken , require('../controllers'+version+'/game/gameController.js'));
	
	/*
	* Route General Error
	*/
	app.get('*', function(req, res){
	  res.status(consts.HTTP_NOT_FOUND).send({
	    	status: false,
	    	msg: "Node Express API Gardna: "+process.env.PROJECT_NAME,
	    	data: {
	    		current_version: process.env.SERVER_VERS
	    	}
		});
	});

}