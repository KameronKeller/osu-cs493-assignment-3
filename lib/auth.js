const jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs');
const { User } = require('../models/user');

const secretKey = 'SuperSecret'

function generateAuthToken(userId) {
    const payload = { sub: userId };
    return jwt.sign(payload, secretKey, { expiresIn: '24h' });
}

async function validateUser(user, password) {
    const authenticated = user && await bcrypt.compare(password, user.password)
    return authenticated
  }

async function requireAuthentication(req, res, next) {
  const authHeader = req.get('Authorization') || '';
  const authHeaderParts = authHeader.split(' ');
  const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : null;
  try {
    const payload = jwt.verify(token, secretKey);
    req.userId = payload.sub;
    const user = await User.findByPk(req.userId)
    req.isAdmin = user.admin
    next();
  } catch (err) {
    res.status(401).json({
      error: "Invalid authentication token provided."
    });
  }
}

function getUserIdFromRequest(req) {
  if (req.params && req.params.userId) {
    return req.params.userId
  } else if (req.body) {
    if (req.body.userId) {
      return req.body.userId
    } else if (req.body.ownerId) {
      return req.body.ownerId
    }
  } else {
    return ''
  }
}

function isAuthorized(req) {
  const userIdInRequest = getUserIdFromRequest(req)
  const userIdFromJwt = req.userId
  if (userIdFromJwt == undefined || userIdFromJwt == null) {
    return false
  }
  return req.isAdmin || userIdFromJwt == userIdInRequest
}

function unauthorizedResponse(res) {
  res.status(403).json({
    error: "Unauthorized to access the specified resource"
  });
}

exports.validateUser = validateUser
exports.generateAuthToken = generateAuthToken
exports.requireAuthentication = requireAuthentication
exports.isAuthorized = isAuthorized
exports.unauthorizedResponse = unauthorizedResponse