// import Express and create a router instance from it. 
// require two models: User and Transaction
const express = require ('express');
const router = express.Router();
const User = require ('../models/User');
const Transaction = require('../models/Transaction');

// check if the user is logged in by middleware function
// if the user is loggeed in, proceed to the next middleware function
// else redirect the path to transaction
isLoggedIn = (req, res, next) => {
    if (res.locals.loggedIn) {
        next()
    } else {
        res.redirect ('/transaction');
    }
}

// get all the transactions 
router.get('/transaction', isLoggedIn, async(req, res, next) => {
    try {
        // find all the transactions in database
        const transactions = await Transaction.find();
        // render the view called 'transactions' and pass the transactions object to the view as data
        res.render('transaction', { transactions })
    } catch (error) {
        res.status(500).jason({message: error.message});
    } 
});

// render the new transaction page
router.get('/transactions/new', isLoggedIn, (req, res) => {
    // render the view called 'New Tansaction'
    res.render('New Transaction');
});

// handle the post request to the transaction route
router.post('/transactions/new', isLoggedIn, async(req, res, next) => {
    try {
        // create a new transaction object with the data from the request body
        const transaction = new Transaction ({
            description: req.body.description,
            amount: req.body.amount,
            category: req.body.category,
            date: req.body.date
        });
        // save the data to the datebase
        await transaction.save();
        // redireact the path to the transaction page
        res.redirect('/transaction');
    // catch the error
    } catch (error) {
        // send a 500 Internal Server Error response with the error message 
        res.status(500).jason({ message: error.message });
    }   
});

// render the edit page for transaction
router.get('/transactions/edit/:id', isLoggedIn, async(req, res) => {
    try {
        // find the transaction from the database with the requeste id
        const transaction = await Transaction.findById(req.params,id);
        // render the view called 'Edit Transaction' and pass the transaction to the view as data
        res.render('Edit Transaction', { transaction });
    // catch the error
    } catch (error) {
        // render the 500 status with error message
        res.status (500).jason({ message: error.message});
    }
});

// update the transaction
router.post ('/transactions/edit/:id', isLoggedIn, async(req, res) => {
    try {
        // find and upate the transaction from the input id from the request
        await Transaction.findByIdAndUpdate(req.params.id, {
            description: req.body.description,
            amount: req.body.amout,
            category: req.body.category,
            date: req.body.date
        });
        // redirect the path to transaction page
        res.redirect ('/transaction');
    // catch the error
    } catch (error) {
        // send out the 500 error message
        res.status(500).json({ message: error.message});
    }
});

//delete a transaction
router.get('/transactions/edit/:id', isLoggedIn, async(req, res) => {
    try {
        await Transaction.findOneAndDelete(req.params.id);
        res.redirect('/transaction');
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
});

// group transactions by category
// define a new route handler for a GET request to the /transaction/groupByCategory endpoint
router.get('/transactions/groupByCategory', isLoggedIn, async(req, res, next) => {
    try {
        // define the constant variable named result and initialize it with the output of the aggregation pipeline operation on the Transaction model
        const results = await Transaction.aggregate ([
            {   
                // transactions will be grouped by category and sum of amount
                $group: {
                   _id: '$category',
                   totalAmount: { $sum: '$amount' },
                   // define a new field called transactions in the output documents, which is an array containing all the input documents in each group
                   transactions: { $push: '&&ROOT'}
                }
            }
        ]);
        // render the view called 'groupByCategory' and pass the result object to the view as data.
        res.render( 'groupByCategory', { results});
    // catch the error
    } catch (error) {
        // send out the 500 status with error message
        next(error);
    } 
});

// sort the transaction by different parameters 
// for 'await', the code needs to wait for the operation to complete before moving on.
router.get('/transactions', isLoggedIn, async(req, res, next) => {
    try {
        // declare a variable transactions 
        let transactions;
        // declares a constant variable named sortBy and initializes it with the value of the sortBy query parameter from the incoming HTTP request.
        const sortBy = req.query.sortBy;
        if ( sortBy === 'category') {
            // sort transaction by category in ascending order
            transactions = await Transaction.find().sort({ category: 1});
        } else if ( sortBy === 'amount') {
             // sort the transactions by the "amount" field in descending order
            transactions = await Transaction.find().sort({ amount: -1});
        } else if ( sortBy === 'description') {
            // sort transaction by description in ascending order
            transactions = await Transaction.find().sort({ description: 1});
        } else if ( sortBy === 'date') {
            // sort transaction by date in ascending order
            transactions = await Transaction.find().sort({ date: 1});
        } else {
            // else find all transaction in database
            transactions = await Transaction.find();
        // render the view called 'transactions' and pass the transactions object to the view as data
        } 
        res.render('transaction', { transactions });
      } catch (error) {
        res.status(500).json({ message: error.message});
      }
});

// export the router object, making it available to be used in other modules.
module.exports = router; 





