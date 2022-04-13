/*
	@Creator: BetCoin Developer <betcoin_contact@protonmail.com> 07/04/2022
	@File: server.js
	@Description: Responsável por chamar o sistema de rotas.
	@morgan: intercepta as chamadas ao servidor, pegando dados de acesso do client.
	@body-parser: Parserar dados recebidos.
*/

const express   = require('express');
const bparser 	= require('body-parser');
const morgan 	= require('morgan');
const cors 		= require('cors');
const log		= require('./helpers/helper.js');
require('dotenv').config({ path: __dirname+'/config/.env' });

const app = express()
			.use(bparser.json())
			.use(bparser.urlencoded({ extended:false }))
			.use(morgan('combined'))
			.use(cors());

//Routes
require(__dirname+"/routes/routes.js")(app);


//Listen
app.listen(process.env.SERVER_PORT,function(){
	log.console("Connected port:" + process.env.SERVER_PORT + " Environment " + process.env.NODE_ENV + " Version " + process.env.SERVER_VERS);
});
