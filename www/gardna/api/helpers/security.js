/*
    Security.js
    Pensado para aumentar a segurança da API.
*/
const consts 	= require(__dirname+"/../config/constants.js");

/** 
 * Limita e rastreia a chamada pela fonte
*/
module.exports.apiToken = function (req,res,next) {

    if(detectPlatformApi(req) || !validApiToken(req)) {

            res.status(consts.HTTP_SERVER_ERRROR).send();

    } else {
        next();
    }

}

/**
 * Detectar e bloquear chamadas do Postman ou Insomnia.
 */
function detectPlatformApi(req){

    if(process.env.NODE_ENV == 'production') {

        return (
            (req.headers['user-agent'] && 
                (req.headers['user-agent'].includes('ostman') || req.headers['user-agent'].includes('nsomnia'))) || 
            
            req.headers['postman-token']
        );

    } else {
        
        return false;

    }

}

/**
 * Validar se existe uma API token
 */
function validApiToken(req) {

    return (
        req.headers['api-token'] &&
        (req.headers['api-token'] == process.env.iosKey ||
        req.headers['api-token'] == process.env.AndroidKey ||
        req.headers['api-token'] == process.env.WebKey)
    );

}

/** 
 * @TODO Adicionar validação por IP e limite de chamadas repetidas.
*/