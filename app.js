require('dotenv').config();
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const {
    intersection
} = require('lodash');
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));
app.use(express.json());
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/bankDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
// SCHEMA FOR DEFAULT ITEMS
const userSchema = new mongoose.Schema({
    custID: {
        type: Number,
        required: true
    },
    firstName: String,
    lastName: String,
    emailID: String,
    amount: Number
});
// SCHEMA MODEL
const User = mongoose.model("user", userSchema);
// I manually inserted 10 users

const transferSchema = new mongoose.Schema({
    moneyFrom: String,
    moneyTo: String,
    amountTransfer: Number
});

const Money = mongoose.model("Money", transferSchema);

const transfer1 = new Money({
    moneyFrom: "Deepak Verma",
    moneyTo: "ved",
    amountTransfer: 3000
})
// transfer1.save();

app.get("/", function (req, res) {
    User.find(function (err, usersFound) {
        if (usersFound.length == 0) {
            User.insertMany(defaultUsers, function (err) {
                if (err)
                    console.log(err);
                else console.log("User inserted success!");
            });
            res.redirect("/");
        } else
            res.render("index", {
                newUserItems: usersFound
            });
    })

})

app.get("/transaction", function (req, res) {
    Money.find(function (err, transfersFound) {
        if (!err)
            res.render("transaction", {
                newMoneyTransfers: transfersFound
            })
    })
})

app.get("/about", function (req, res) {
    res.render("about");
})
app.get("/profile/:userID", function (req, res) {
    let testCase = req.params.userID;
    User.findOne({
        custID: testCase
    }, function (err, userFound) {
        if (!err)
            res.render("profile", {
                ejsfirstName: userFound.firstName,
                ejsLastName: userFound.lastName,
                ejsUserEmail: userFound.emailID,
                ejsUserBalance: userFound.amount
            });
        else console.log(err);
    })
});

app.post("/moneyTransfer", async function (req, res) {
    var fromName = "";
    var toName = "";
    await User.findOne({
            custID: parseInt(req.body.ejsfromID)
        },
        function (err, usersFound) {
            if (!err) {
                User.updateOne({
                    custID: parseInt(req.body.ejsfromID)
                }, {
                    $inc: {
                        amount: -req.body.ejsAmount
                    }
                })
                fromName = usersFound.firstName + " " + usersFound.lastName;
                console.log(usersFound.amount);
            } else console.log("deepak not found");
        })
    await User.find({
            custID: parseInt(req.body.ejstoID)
        },
        function (err, users1Found) {
            if (!err) {
                User.updateOne({
                    custID: parseInt(req.body.ejstoID)
                }, {
                    $inc: {
                        amount: req.body.ejsAmount
                    }
                })

                toName = users1Found[0].firstName + " " + users1Found[0].lastName;


            } else console.log(err);
        })


    const transfer2 = new Money({
        moneyFrom: fromName,
        moneyTo: toName,
        amountTransfer: req.body.ejsAmount
    });

    transfer2.save();
  
    res.redirect("/");
})

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, function () {
    console.log("Sever running on port 3000");
});