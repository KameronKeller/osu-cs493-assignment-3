const jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')

const secretKey = 'SuperSecret'

function generateAuthToken(email) {
    const payload = { sub: email };
    return jwt.sign(payload, secretKey, { expiresIn: '24h' });
}

async function validateUser(user, password) {
    const authenticated = user && await bcrypt.compare(password, user.password)
    return authenticated
  }

exports.validateUser = validateUser
exports.generateAuthToken = generateAuthToken;