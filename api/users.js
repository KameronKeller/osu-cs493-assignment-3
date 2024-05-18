const { Router } = require('express')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')
const { User, UserClientFields } = require('../models/user')
const { ValidationError } = require('sequelize')

const { generateAuthToken, validateUser, requireAuthentication, isAuthorized, unauthorizedResponse } = require('../lib/auth')

const router = Router()

async function getUser(email) {
  const user = await User.findOne({ where: { email: email } });
  return user
}

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', async function (req, res) {
  const userId = req.params.userId
  const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
  res.status(200).json({
    businesses: userBusinesses
  })
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', async function (req, res) {
  const userId = req.params.userId
  const userReviews = await Review.findAll({ where: { userId: userId }})
  res.status(200).json({
    reviews: userReviews
  })
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', async function (req, res) {
  const userId = req.params.userId
  const userPhotos = await Photo.findAll({ where: { userId: userId }})
  res.status(200).json({
    photos: userPhotos
  })
})

/*
 * Route to get info about a user.
 */
router.get(
  '/:userId',
  requireAuthentication,
  async function (req, res) {
    const userId = req.params.userId
    if (isAuthorized(req)) {
      const user = await User.findByPk(userId, {attributes: ['name', 'email', 'admin']})
      if (user) {
        res.status(200).send(user)
      } else {
        next()
      }
    } else {
      unauthorizedResponse(res)
    }

})


/*
 * Route to create a user.
 */
router.post('/', async function (req, res) {
  try {
    const user = await User.create(req.body, {fields: UserClientFields})
    res.status(201).send({ id: user.id })
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message })
    } else {
      throw e
    }
  }
})

/*
 * Route to login as a user.
 */
router.post("/login", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  if (!req.body || !email || !password) {
    res.status(400).json({
      error: "Request body needs user email and password.",
    });
  } else {
    try {
      const user = await getUser(email)
      const authenticated = await validateUser(user, password);
      if (authenticated) {
        const token = generateAuthToken(user.id)
        res.status(200).send({token: token});
      } else {
        res.status(401).send({
          error: "Invalid authentication credentials"
        });
      }
    } catch (e) {
      res.status(500).send({
        error: "Error logging in.  Try again later."
      });
    }
  }
});

module.exports = router
