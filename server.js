var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

// GET /todos?completed=true&q=house
app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	});

	//var queryParams = req.query;
	// var filteredTodos = todos;

	// // if has property & completed === 'true'
	// if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
	// 	// fileredTodos = _.where(fileredTodos, ?)
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: true
	// 	});

	// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
	// 	// else if has prop & completed if 'false'
	// 	filteredTodos = _.where(filteredTodos, {
	// 		completed: false
	// 	});
	// }

	// // query parameter ?q=
	// if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
	// 	filteredTodos = _.filter(filteredTodos, function(todo) {
	// 		// -1 means that it doesnt exist
	// 		return todo.description.toLowerCase.indexOf(queryParams.q.toLowerCase) > -1;
	// 	});
	// }

	// res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});
// var matchedTodo = _.findWhere(todos, {
// 	id: todoId
// });
// var matchedTodo;

// iterate over todos array. find the match
// todos.forEach(function (todo) {
// 	if (todoId === todo.id) {
// res.json(); = found
// 		matchedTodo = todo;
// 	}
// });

// If matchedTodo is true i.e. got something returned
// if (matchedTodo) {
// 	res.json(matchedTodo);
// } else {
// 	// res.status(404).send(); = not found
// 	res.status(404).send();
// }
//res.send('Asking for todo with id of ' + req.params.id);
// });

// POST /todos
app.post('/todos', function(req, res) {
	// body = req.body; 
	// use _.pick to only pick description and completed
	var body = _.pick(req.body, 'description', 'completed');

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}
	description = body.description.trim();
	// call create on db.todo db.todo.create
	db.todo.create(body).then(function(todo) {
		// respond with 200 and todo - toJSON
		res.json(todo.toJSON());
	}, function(e) {
		// res.status(400).json(e)
		res.status(400).json(e);
	});

	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
	// 	return res.status(400).send();
	// }

	// // set body.description to the trimmed value
	// body.description = body.description.trim();

	// // add id field & increment it afterwards (++)
	// body.id = todoNextId++;
	// // push body into array
	// todos.push(body);
	// // console.log('description: ' + body.description);
	// res.json(body);
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'no todo with id'
			});
		} else {
			res.status(204).send();
		}
	}, function() {
		res.status(500).send();
	});
	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// });
	// if (!matchedTodo) {
	// 	res.status(400).json({
	// 		"error": "no todo found with that id"
	// 	});
	// } else {
	// 	todos = _.without(todos, matchedTodo);
	// 	res.json(matchedTodo);
	// }

});

// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	// var matchedTodo = _.findWhere(todos, {
	// 	id: todoId
	// });
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	// if (!matchedTodo) {
	// 	return res.status(404).send();
	// }

	// if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}
	// else if (body.hasOwnProperty('completed')) {
	// 	// bad
	// 	return res.status(400).send();
	// }

	// if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}
	// else if (body.hasOwnProperty('description')) {
	// 	return res.status(400).send();
	// }

	// model method to find instance
	db.todo.findById(todoId).then(function(todo) {
		// findById went well
		if (todo) {
			todo.update(attributes).then(function(todo) {
				// todo.update went well
				res.json(todo.toJSON());
			}, function(e) {
				// to.update went wrong
				res.status(400).json(e);
			});
		} else {
			// id doesnt exist
			res.status(404).send();
		}
	}, function() {
		// findById went wrong
		res.status(500).send();
	});


	// This is an instance method not a model one

	// Update the todo item & return it
	// _.extend(matchedTodo, validAttributes);
	// res.json(matchedTodo);
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});