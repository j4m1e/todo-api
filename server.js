var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function (req, res) {
	res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo;

	// iterate over todos array. find the match
	todos.forEach(function (todo) {
		if (todoId === todo.id) {
			// res.json(); = found
			matchedTodo = todo;
		}
	});

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
app.post('/todos', function (req, res) {
	body = req.body;

	// add id field & increment it afterwards (++)
	body.id = todoNextId++;
	// push body into array
	todos.push(body);
	// console.log('description: ' + body.description);
	res.json(body);
});

app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!');
});