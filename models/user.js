const { DataTypes } = require("sequelize");

const sequelize = require("../lib/sequelize");
const { Review } = require('./review')
const { Business } = require('./business')

const User = sequelize.define("user", {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  password: {
    type: DataTypes.STRING,
    set(value) {
      // TODO: implement HASH!!!!
      console.log(
        "\x1b[31m%s\x1b[0m",
        "!!!!!!! *_-*_-*_-*_-* WARNING PASSWORDS NOT HASHED!!!! *_-*_-*_-*_-*\n \
        !!!!!!! *_-*_-*_-*_-* WARNING PASSWORDS NOT HASHED!!!! *_-*_-*_-*_-*\n"
      );
      this.setDataValue("password", value);
      //   this.setDataValue("password", hash(value));
    },
  },
  admin: { type: DataTypes.BOOLEAN, allowNull: false },
});

User.hasMany(Business, { foreignKey: { allowNull: false } })
Business.belongsTo(User)

User.hasMany(Review, { foreignKey: { allowNull: false } })
Review.belongsTo(User)

// const user = User.build({
//   username: "someone",
//   password: "NotSo§tr0ngP4$SW0RD!",
// });
// console.log(user.password); // '7cfc84b8ea898bb72462e78b4643cfccd77e9f05678ec2ce78754147ba947acc'
// console.log(user.getDataValue("password"));

exports.User = User;
exports.UserClientFields = [
  "ownerId",
  "name",
  "address",
  "city",
  "state",
  "zip",
  "phone",
  "category",
  "subcategory",
  "website",
  "email",
];
