const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE vendas (id INTEGER PRIMARY KEY, nome TEXT, data TEXT, tipo TEXT, cupom TEXT)");
});

app.post('/add-sale', (req, res) => {
  const { nome, data, tipo, cupom } = req.body;
  db.run(`INSERT INTO vendas(nome, data, tipo, cupom) VALUES(?, ?, ?, ?)`, [nome, data, tipo, cupom], function(err) {
    if (err) {
      return console.log(err.message);
    }
    res.send({ id: this.lastID });
  });
});

app.get('/sales', (req, res) => {
  db.all("SELECT * FROM vendas", [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
