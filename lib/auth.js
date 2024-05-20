const jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')
const { User } = require('../models/user')
const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')

const secretKey = 'SuperSecret'

const getDbEntity = {
  '/:businessId': Business,
  '/:photoId': Photo,
  '/:reviewId': Review,
  '/:userId': User,
  '/:userId/businesses': Business,
  '/:userId/reviews': Review,
  '/:userId/photos': Photo
}

const getUserIdColumnName = {
  '/:businessId': 'ownerId',
  '/:photoId': 'userId',
  '/:reviewId': 'userId',
  '/:userId': 'userId',
  '/:userId/businesses': 'ownerId',
  '/:userId/reviews': 'userId',
  '/:userId/photos': 'userId'
}

const getParamsKey = {
  '/businesses': 'businessId',
  '/photos': 'photoId',
  '/reviews': 'reviewId',
  '/users': 'userId'
}

function generateAuthToken(userId) {
    const payload = { sub: userId }
    return jwt.sign(payload, secretKey, { expiresIn: '24h' })
}

async function validateUser(user, password) {
    const authenticated = user && await bcrypt.compare(password, user.password)
    return authenticated
  }

async function requireAuthentication(req, res, next) {
  const authHeader = req.get('Authorization') || ''
  const authHeaderParts = authHeader.split(' ')
  const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : null
  try {
    const payload = jwt.verify(token, secretKey)
    req.userId = payload.sub
    const user = await User.findByPk(req.userId)
    req.isAdmin = user.admin
    next()
  } catch (err) {
    res.status(401).json({
      error: "Invalid authentication token provided."
    })
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

async function idOwnsRecord(req, userId) {
  const dbEntity = getDbEntity[req.route.path]
  const paramsKey = getParamsKey[req.baseUrl]
  const userIdColumnToCheck = getUserIdColumnName[req.route.path]
  const requestedId = req.params[paramsKey]

  const entry = await dbEntity.findOne({
    where: {
      [userIdColumnToCheck]: userId,
      id: requestedId,
    },
  })
  return entry !== null
}

async function isAuthorized(req) {
  const userIdInRequest = getUserIdFromRequest(req)
  const userIdFromJwt = req.userId

  if (userIdFromJwt == undefined || userIdFromJwt == null) {
    return false
  }
  if (req.isAdmin) {
    return true
  }
  if (req.method == "PATCH" || req.method == "DELETE") {
    const ownsRecord = await idOwnsRecord(req, userIdFromJwt)
    if (!ownsRecord) {
      return false
    }
  }
  return userIdFromJwt == userIdInRequest
}

function unauthorizedResponse(res) {
  res.status(403).json({
    error: "Unauthorized to access the specified resource"
  })
}

exports.validateUser = validateUser
exports.generateAuthToken = generateAuthToken
exports.requireAuthentication = requireAuthentication
exports.isAuthorized = isAuthorized
exports.unauthorizedResponse = unauthorizedResponse