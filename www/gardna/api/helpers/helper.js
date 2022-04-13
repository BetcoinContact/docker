/*
	Função que retorna uma hash aleatória
	@param lenght tamanho da hash a ser gerada
*/
const consts 	= require(__dirname+"/../config/constants.js");

function makeHash (length,callback) {

	var result           = '';
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
	   result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	callback(result);
 
 }

module.exports.makeHash = makeHash;

/*
	Função para log no terminal
	@param text Texto do LOG
*/
module.exports.console = function (text) {

	// Obtém a data/hora atual
	var data = new Date();

	// Guarda cada pedaço em uma variável
	var dia     = data.getDate();           // 1-31
	var dia_sem = data.getDay();            // 0-6 (zero=domingo)
	var mes     = data.getMonth();          // 0-11 (zero=janeiro)
	var ano2    = data.getYear();           // 2 dígitos
	var ano4    = data.getFullYear();       // 4 dígitos
	var hora    = data.getHours();          // 0-23
	var min     = data.getMinutes();        // 0-59
	var seg     = data.getSeconds();        // 0-59
	var mseg    = data.getMilliseconds();   // 0-999
	var tz      = data.getTimezoneOffset(); // em minutos

	// Formata a data e a hora (note o mês + 1)
	var str_data = dia + '/' + (mes+1) + '/' + ano4;
	var str_hora = hora + ':' + min + ':' + seg;
	
	console.log(str_data + ' - ' + str_hora +" -> "+text);

}

/*
	Função para extrair somente os erros de validações do sequeliza
	@param errors array de erros
*/
module.exports.errorsArray = function (errors,callback) {

	var filter = [];

	for (var i = errors.length - 1; i >= 0; i--) {
		filter.push(errors[i].message)
	}

	callback(filter);

}

/*
	Função para remover campos que podem ter vindo a mais na API
	@param fields campos aceitos
	@param body campos recebidos
*/
module.exports.acceptFields = function (fields,body,callback) {

	var objFilter = {};

	for (var i = fields.length - 1; i >= 0; i--) {
		if(body.hasOwnProperty(fields[i])){
			objFilter[fields[i]] = body[fields[i]];
		}
	}

	callback(objFilter);

}

/*
	Função genérica para verificar se os campos esperas foram enviamos.
	@param fields campos obrigatórios
	@param body campos recebidos
*/
module.exports.requiredFields = function (requiredFields) {

	return async function (req, res, next) {

		var fields = [];

		for (var i = requiredFields.length - 1; i >= 0; i--) {
			if(!req.body.hasOwnProperty(requiredFields[i])){
				fields.push(" The field "+requiredFields[i]+" is required.");
			}
		}

		if(fields.length == 0) {
			next();
		} else {
			res.status(consts.HTTP_BAD_REQUEST).send({
				status: consts.statusFalse,
				msg: "Required fields.",
				errors: fields
			});
		}
	}

}

/*
	Função para gerar a hash de ativação
	@param id_usuario id gerado do usuário
*/
module.exports.activeCode = function (id_usuario,callback) {

	var hash = (parseInt(id_usuario) + 1500000).toString();
	var activeCode = Buffer.from(hash).toString('base64');// Base64
	
	var confusedHash = '';
	makeHash(10,function(hash_){
		confusedHash = hash_;
	});

	console.log(Buffer.from(activeCode, 'base64').toString());
	callback(confusedHash+activeCode);

}

/*
	Função para fazer o decode do codigo de ativação 
	@param activeCode código gerado
*/
module.exports.reverseActiveCode = function (activeCode,callback) {

	activeCode = activeCode.substring(10, activeCode.length);	

	id_usuario = parseInt(Buffer.from(activeCode, 'base64')) - 1500000;
	callback(id_usuario);

}