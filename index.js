//index.js
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose(); // Import SQLite3
const PostfixCalculator = require('./PostfixCalculator');

const app = express();
const port = 3000;

const db = new sqlite3.Database('./database.db', err => {
    if (err) {
        console.error('Error opening database', err);
        return;
    }
    console.log('Connected to the database');
    // Create table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS expressions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expression TEXT NOT NULL,
        result REAL NOT NULL
    )`);
});

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    db.all('SELECT * FROM expressions', (err, rows) => {
        if (err) {
            console.error('Error retrieving expressions from database', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.send(`
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                    color: #333;
                }
                form {
                    margin-bottom: 20px;
                }
                input[type="text"] {
                    padding: 10px;
                    margin-right: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                button {
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #0056b3;
                }
                h2 {
                    color: #007bff;
                }
                ul {
                    list-style-type: none;
                    padding: 0;
                }
                li {
                    background-color: #fff;
                    padding: 10px;
                    margin-bottom: 5px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
            </style>
            <form action="/evaluate" method="post">
                <label for="expression">Enter a postfix expression:</label>
                <input type="text" id="expression" name="expression" required>
                <button type="submit">Evaluate</button>
            </form>
            <h2>Previous Values</h2>
            <ul>
                ${rows.map(row => `<li>${row.expression} = ${row.result}</li>`).join('')}
            </ul>
        `);
    });
});

app.post('/evaluate', (req, res) => {
    const { expression } = req.body;
    const calculator = new PostfixCalculator();

    try {
        const result = calculator.evaluate(expression);
        db.run('INSERT INTO expressions (expression, result) VALUES (?, ?)', [expression, result], err => {
            if (err) {
                console.error('Error inserting expression into database', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.send(`
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f0f0f0;
                        color: #333;
                    }
                    p {
                        font-size: 18px;
                    }
                    button {
                        padding: 10px 20px;
                        background-color: #007bff;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    button:hover {
                        background-color: #0056b3;
                    }
                </style>
                <p>Result: ${result}</p>
                <form action="/" method="get">
                    <button type="submit">Go back</button>
                </form>
            `);
        });
    } catch (error) {
        res.send(`
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                    color: #333;
                }
                p {
                    font-size: 18px;
                    color: red;
                }
                button {
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #0056b3;
                }
            </style>
            <p>Error: ${error.message}</p>
            <form action="/" method="get">
                <button type="submit">Go back</button>
            </form>
        `);
    }
});



app.listen(port, () => {
    console.log(`Postfix Calculator app listening at http://localhost:${port}`);
});
