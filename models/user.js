var bcrypt = require('bcryptjs');
var _ = require('underscore');

module.exports = function (sequelize, DataTypes) {
	var user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		salt: {
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function (value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	}, {
		hooks: {
			beforeValidate: function (user, options) {
				//user.email if (typeof string) set user.email.lowercase
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		classMethods: {
			authenticate: function (body) {
				return new Promise(function (resolve, reject) {
						// validation that there is a string email and password
					if (typeof body.email !== 'string' || typeof body.password !== 'string') {
						return reject();
					}

					//db.user.findOne email = email passed in res.json to send back or 404 if it fails but a 500 if it all fails
					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						// went well
						if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
							// user does not exist! or the password is not the same as in the database
							// 401 is authertication was possible but failed
							return reject();
						}
						resolve(user); 

					}, function(e) {
						reject();
					});
				});
			}
		},
		instanceMethods: {
			toPublicJSON: function () {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
			}
		}
	});

	return user;
};