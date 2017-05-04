var express = require('express');
var router = express.Router();
//connect to database
const knex = require('../db/knex');

/* This router is mounted at localhost:3000/todo. Every route that gets defined will come after todo */
router.get('/', function(req, res, next) {
  knex('todo')
    .select()
    .then(todos => {
      res.render('all', { todos: todos });
    });
});

function respondAndRenderTodo(id, res, viewName) {
  if (typeof id != 'undefined') {
    knex('todo')
      .select()
      .where ('id', id)
      .first()
      .then(todos => {
        res.render(viewName, todos);
      });
  } else {
    res.status(500);
    res.render('error', {message: 'Invalid Id'});
  }
}

router.get('/new', function(req, res, next) {
  res.render('new');
});

router.get('/:id', function(req, res, next) {
  const id = req.params.id;
  respondAndRenderTodo(id, res, 'single');
});

router.get('/:id/edit', function(req, res, next) {
  const id = req.params.id;
  respondAndRenderTodo(id, res, 'edit');
});

function validTodo(todo) {
  return typeof todo.title == 'string' && todo.title.trim() != '' && typeof todo.priority != 'undefined' && !isNaN(Number(todo.priority));
}

function validateTodoInsertUpdateRedirect(req, res, callback){
  if(validTodo(req.body)) {
    let todo = {
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
    };
    callback(todo);
  } else {
    res.status(500);
    res.render('error', {message: 'Invalid Todo'});
  }
}

router.post('/', function(req, res, next) {
  validateTodoInsertUpdateRedirect(req, res, (todo) =>{
    todo.date = new Date();
    knex('todo')
      .insert(todo, 'id')
      .then(ids => {
          const id = ids[0];
          res.redirect(`/todo/${id}`);
      });
  });
});

router.put('/:id', (req,res) => {
  validateTodoInsertUpdateRedirect(req, res, (todo) =>{
    // todo.date = new Date();
    knex('todo')
    .where('id', req.params.id)
      .update(todo, 'id')
      .then(() => {
          res.redirect(`/todo/${req.params.id}`);
      });
  });
});

router.delete('/:id', (req,res) => {
  const id = req.params.id;
  if (typeof id != 'undefined') {
    knex('todo')
      .where ('id', id)
      .del()
      .then(() => {
        res.redirect('/todo');
      });
  } else {
    res.status(500);
    res.render('error', {message: 'Invalid Id'});
  }
});

module.exports = router;
