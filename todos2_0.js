/**
 * Created by kathydoody on 12/18/13.
 */


can.fixture({
    "GET /services/todos": function () {
        return [
            {name: "Feed the dogs", completed: true, id: 1},
            {name: "Play hockey", completed: false, id: 2},
            {name: "Learn CanJs", completed: false, id: 3}
        ]
    },

    "Delete /services/todos/{id}": function () {
        return{};
    },

    "POST /services/todos": function () {
        console.log("you just created a new todo");
        return {id: Math.random()}
    },

    "PUT /services/todos/{id}": function () {
        console.log("you just updated the todo");
        return {};
    }

});


//  can.fixture.delay = 2000;  will hold the data back for 2 seconds


Todo = can.Model.extend({
    findAll: "/services/todos",
    create: "/services/todos",
    destroy: "/services/todos/{id}",
    update: "/services/todos/{id}"
}, {});


/*  extend the regular List object created by Model and add
 any helper functions you want*/

Todo.List = Todo.List.extend({
    filter: function (check) {
        var list = new this.constructor;  // could use Todo.List but better to use this
        // so you can change Todo and still inherit here

        this.each(function (todo) {
            if (check(todo)) {
                list.push(todo)
            }
        });

        return list;
    },

    active: function () {
        return this.filter(function (todo) {
            return !todo.attr("completed");
        });
    },

    completed: function () {
        return this.filter(function (todo) {
            return todo.attr("completed");
        });
    },

    activeCount: function () {
        return this.active().attr("length");
    },

    completedCount: function () {
        return this.completed().attr("length");
    }

});


can.Component.extend({
    tag: "todos-create",
    template: '<input id="new-todo" placeholder="What needs to be done?" can-enter="createTodo" autofocus="">',

    scope: {
        createTodo: function (context, el, ev) {
            if (el.val) {
                new Todo({
                    completed: false,
                    name: el.val()
                }).save();
                el.val("");
            }
        }
    }
});

can.Component.extend({
    tag: "todos-list",
    template: can.view("templates/todoList.hbs"),
    scope: {
        editTodo: function (todo) {
            todo.attr("editing", true);
        },
        updateTodo: function (todo, el) {
            todo.removeAttr("editing");
            todo.attr("name", el.val());
            todo.save();
        }
    }
});

can.Component.extend({
    tag: "todos-app",

    scope: {
        todos: new Todo.List({}),

        displayedTodos: function () {
            var filter = can.route.attr("filter"),
                todos = this.attr("todos");

            if (filter === "active") {
                return todos.active();
            } else if (filter === "completed") {
                return todos.completed();
            }
            return todos;
        },

        /* This will remove the elements from the list but not
         *  from the server - that would require using the destroy
         *  method
         *  */
        removeComplete: function () {
            console.log("remove the finished");

            var completedTodos = this.attr("todos").completed();
            var allTodos = this.attr("todos");

            completedTodos.forEach(function (el, ind, list) {
                console.log("item: ")
                allTodos.splice(ind, 1);
            })


        }
    },
    helpers: {
        filterLink: function (text, filterValue) {

            var attrs = {};
            if (filterValue) {
                attrs.filter = filterValue;
            }
            return can.route.link(text, attrs, {
                className: can.route.attr("filter") === filterValue ? "selected" : ""
            });
        },
        plural: function (singular, count) {
            var value = count();
            if (value === 1) {
                return singular;
            } else {
                return singular + "s";
            }

        }
    },

    events: {
        "{Todo} created": function (Todo, ev, newTodo) {
            this.scope.attr("todos").push(newTodo);
        }
    }
});


/*
 * This creates a new empty list the automatically makes the
 * FindAll ajax call defined in the model definition above
 * */
//var todos = new Todo.List({});  - this is now in the todos-app component

can.route(":filter");  // makes a pretty url
can.route.ready();

var frag = can.view("templates/main-app.hbs", {});

$("#app").html(frag);


/*
 This was version 1. it used findAll on the model and the code
 to provide the todos and compute wer in the callback.  This is
 replaced by using the model's .List function which calls findAll
 on the model

 Todo.findAll({}, function(todos){

 var itemsLeft = can.compute(function(){
 var count = 0;
 todos.each(function(todo){
 if(!todo.attr("completed")){
 count++;
 }
 })
 return count;
 })

 var frag = can.view("app-template", {
 todos: todos,
 itemsLeft: itemsLeft
 });

 $("#app").html(frag);

 })*/

