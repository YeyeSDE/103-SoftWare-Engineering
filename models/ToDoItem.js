
'use strict';
//import mongoose library
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema; // create schema by mongoose
// define the variable ObjectId in Mongoose schema
const ObjectId = mongoose.Schema.Types.ObjectId; 

// set schema for toDoItem by the given properties. 
var toDoItemSchema = Schema( {
  item: String,
  completed: Boolean,
  createdAt: Date,
  priority: Number,
  userId: {type:ObjectId, ref:'user' }
} );

// export the model so it can be used elsewhere
module.exports = mongoose.model( 'ToDoItem', toDoItemSchema );
