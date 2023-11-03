const express = require('express');
const nodemailer = require('nodemailer');
const cron = require('node-cron')
const bcrypt = require('bcrypt')
const app = express();
const port = 5656;
app.use(express.json());
const mysql = require('mysql');

//database connection start from here
const connection = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: "",
    database: 'task13',
    port: 3306
})
connection.connect(function (err) {
    if (err) {
        console.log("Error", err.sqlMessage);
    }
    else {
        console.log("Database Connection Established...");
    }
})
///database connect end here
//email message options
let user = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "iramnaazkhan314@gmail.com",
        pass: "vpdb abuv jqjj ditx"
    }
})

app.post('/sendmail', (req, res) => {
    try {
        const userData = {
            id: req.body.id,
            email: req.body.email,
            password: req.body.password
        }
        console.log(userData)
        bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
            if (err) {
                console.error("Error for hashing password", err);
                return res.status(500).json({ Error: "Error for hashing password" });
            } else {
                const value = [userData.email, hash, userData.id];
                const sqlQuery = "INSERT INTO nodemailer (email, password, id) VALUES (?,?,?)";
                connection.query(sqlQuery, value, (error, result) => {
                    if (error) {
                        console.error("Error in database query", error);
                        return res.status(500).json({ Error: "Error in database query" });
                    }
                    if (result.affectedRows > 0) {
                        // Mail 

                        const adminMail = userData.email;
                        const subject = "User login Successfully";
                        const mailBody = `Welcome ${userData.email}!
                            Use ${adminMail} as your username and password as you provided.
                            Thank You!`;
                        const mailOptions = {
                            from: "iramnaazkhan314@gmail.com",
                            to: adminMail,
                            subject: subject,
                            text: mailBody
                        };
                        cron.schedule('* * * * *', () => {
                            user.sendMail(mailOptions, (err, info) => {
                                if (err) {
                                    console.error(`Failed to send mail to ${userData.email}`, err);
                                } else {
                                    console.log("Email sent successfully");
                                }
                            });
                        });
                        res.send({
                            message: "User Registration Successful"
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

app.post('/getmail', (req, res) => {
    try {
        let sqlQuery = `SELECT  email, password FROM nodemailer`;
        connection.query(sqlQuery, function (error, result) {
            if (error) {
                console.log("error", error.sqlMessage);
            }
            else {
                res.json(result)
            }
        })
    } catch (error) {
        res.send(error.sqlMessage);
    }

})

app.patch('/updatemail/:id', (req, res) => {
    try {
        const userData = req.body;
        const id = req.params.id;
        console.log(userData);

        const sqlQuery = 'UPDATE nodemailer SET email = ?, password = ? WHERE id = ?';
        const values = [req.body.email, req.body.password, id];
        connection.query(sqlQuery, values, function (error, result) {
            if (error) {
                console.log("ERROR", error.sqlMessage);
                res.status(500).json({ error: error.sqlMessage });
            } else {
                res.json(result);
            }
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete('/deletemail/:id' , (req, res)=>{
        const id = req.params.id;
        const sql = "Delete FROM nodemailer WHERE id = ?";
        connection.query(sql, [id], (err, result) => {
            if(err) return res.json({Error: "delete"});
            return res.json('Deleted Succesfully')
        })
})

app.listen(port, (req, res) => {
    console.log(`nodemailer is listeing at port ${port}`)
})

