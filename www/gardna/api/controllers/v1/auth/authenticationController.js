const jwt       = require('jsonwebtoken');
const consts 	= require(__dirname+"/../../../config/constants.js");

exports.generateToken = async (data) => {
    return jwt.sign(data, process.env.salt_key, { expiresIn: '1d' });
}

exports.decodeToken = async (req,res, continueAction) => {

    var token = req.headers['authorization'].split('Bearer ')[1];
    jwt.verify(token, process.env.salt_key, function (error, decoded) {
        if (error) {
            res.status(consts.HTTP_UNAUTHORIZED).json({
                status: consts.statusFalse,
                msg: "Token '"+token+"' invalid"
            });
        } else {
            continueAction(decoded);
        }
    });
    return;

}

exports.authorize = async function (req, res, next) {
    
    var token = req.headers['authorization'];

    if (!token) {
        res.status(consts.HTTP_UNAUTHORIZED).json({
            status: consts.statusFalse,
            msg: "Access denied",
            data: null
        });
    } else {
        
        token = token.split('Bearer ')[1];
        jwt.verify(token, process.env.salt_key, function (error, decoded) {
            if (error) {
                res.status(consts.HTTP_UNAUTHORIZED).json({
                    status: consts.statusFalse,
                    msg: "Token '"+token+"' invalid",
                    data: null
                });
            } else {
                next();
            }
        });

    }
};