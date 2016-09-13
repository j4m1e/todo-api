var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

// Model
var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			// min is 1 and max is 250 characters
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

var User = sequelize.define('user', {
	email: Sequelize.STRING
});

Todo.belongsTo(User);
User.hasMany(Todo);

// {force: true} will wipe all tables and recreate them
sequelize.sync({
	// force: true
}).then(function() {
	console.log('Everything is synced');
	User.findById(1).then(function(user) {
		user.getTodos({
			where: {
				completed: false
			}
		}).then(function(todos) {
			todos.forEach(function (todo) {
				console.log(todo.toJSON());
			});
		});
	});
	// User.create({
	// 	email: 'jamie@thetylers.me.uk'
	// }).then(function () {
	// 	return Todo.create({
	// 		description: 'clean yard'
	// 	});
	// }).then(function (todo) {
	// 	return User.findById(1).then(function (user) {
	// 		user.addTodo(todo);
	// 	});
	// });

	// fetch todo item by its id - findAll, findById or findOne
	// if found, print it to the screen using toJSON
	// if not found print to the screen todo not found
	// Todo.findById(1).then(function (todo) {
	// 	if (todo) {
	// 		console.log(todo.toJSON());
	// 	} else {
	// 		console.log('todo not found');
	// 	}
	// });
	// Todo.create({
	// 	description: 'Take out trash'
	// 		// completed: false
	// }).then(function(todo) {
	// 	return Todo.create({
	// 		description: 'Clean office'
	// 	});
	// }).then(function() {
	// 	// return Todo.findById(1)
	// 	return Todo.findAll({
	// 		where: {
	// 			description: {
	// 				$like: '%Office%'
	// 			}
	// 		}
	// 	});
	// }).then(function(todos) {
	// 	if (todos) {
	// 		todos.forEach(function (todo) {
	// 			console.log(todo.toJSON());
	// 		})
	// 	} else {
	// 		console.log('no todo found');
	// 	}
	// }).catch(function(e) {
	// 	console.log(e);
	// });
});