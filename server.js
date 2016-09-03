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
	var queryParams = req.query;
	var filteredTodos = todos;

	// if has property & completed === 'true'
	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		// fileredTodos = _.where(fileredTodos, ?)
		filteredTodos = _.where(filteredTodos, {
			completed: true
		});

	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		// else if has prop & completed if 'false'
		filteredTodos = _.where(filteredTodos, {
			completed: false
		});
	}

	// query parameter ?q=
	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			// -1 means that it doesnt exist
			return todo.description.toLowerCase.indexOf(queryParams.q.toLowerCase) > -1;
		});
	}

	res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	// var matchedTodo;

	// iterate over todos array. find the match
	// todos.forEach(function (todo) {
	// 	if (todoId === todo.id) {
	// res.json(); = found
	// 		matchedTodo = todo;
	// 	}
	// });

	// If matchedTodo is true i.e. got something returned
	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		// res.status(404).send(); = not found
		res.status(404).send();
	}
	//res.send('Asking for todo with id of ' + req.params.id);
});

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
	}, function (e) {
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
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	if (!matchedTodo) {
		res.status(400).json({
			"error": "no todo found with that id"
		});
	} else {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}

});

// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if (!matchedTodo) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		// bad
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	// Update the todo item & return it
	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});