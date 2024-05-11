const { DataTypes } = require('sequelize')

const sequelize = require("../lib/sequelize");
const { Business } = require("./business");
const { Review } = require("./review");

const User = sequelize.define('user', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    admin: { type: DataTypes.BOOLEAN, allowNull: true }
})

User.hasMany(Business, { foreignKey: {name: 'ownerId', allowNull: false }})
Business.belongsTo(User)

User.hasMany(Review, { foreignKey: {name: 'userId', allowNull: false }})
Review.belongsTo(User)

exports.User = User
exports.UserClientFields = [
    'name',
    'email',
    'password',
    'admin'
]