var bcrypt = require('bcryptjs');
const { DataTypes } = require('sequelize')

const sequelize = require("../lib/sequelize");
const { Business } = require("./business");
const { Review } = require("./review");

async function hashPassword(password) {
    return await bcrypt.hash(password, 8);
}

const User = sequelize.define('user', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    admin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
})

User.beforeCreate(async (user, options) => {
    const hashedPassword = await hashPassword(user.password);
    console.log("== hashedPassword", hashedPassword);
    user.password = hashedPassword;
  });

User.beforeBulkCreate( (users, options) => {
    users.forEach( (user) => {
        // hash synchronously on db init
        // ref: https://stackoverflow.com/a/73513791/7100879
        const hashedPassword = bcrypt.hashSync(user.password, 8);
        console.log("== hashedPassword", hashedPassword);
        user.password = hashedPassword
    })
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
]