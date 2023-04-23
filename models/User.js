
'use strict';
// import mongoose library and mongoose and create the schema by mongoose
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

/// create user schema with different parameters.
var userSchema = Schema( {
  username:String,
  passphrase: String,
  age:Number,
} );

// export the user model so it can be used elsewhere
module.exports = mongoose.model( 'User', userSchema );
