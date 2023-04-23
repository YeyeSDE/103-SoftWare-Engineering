'use strict';
// import mongoose library
const mongoose = require( 'mongoose' );
// create schema by mongoose
const Schema = mongoose.Schema;

// define the transaction schema
var transactionSchema = new Schema( {
    description: {type: String, required: true},
    amount: {type: Number, require: true},
    category: {type: String, require: true},
    date: {type: Date, default: Date.now},
});

// export the transaction model so it can used elsewhere
module.exports = mongoose.model( 'Transaction', transactionSchema );