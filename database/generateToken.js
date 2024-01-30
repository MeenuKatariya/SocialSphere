const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({id}, "gfds",{
    expiresIn:"30d"
    })
}

module.exports = generateToken;