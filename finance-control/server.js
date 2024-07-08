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

// Endpoint para calcular métricas
app.get('/metrics', async (req, res) => {
  try {
      const snapshot = await db.ref('vendas').once('value');
      const vendas = snapshot.val();

      let totalGains = 0;
      let totalCount = 0;

      if (vendas) {
          totalCount = Object.keys(vendas).length;
          for (const id in vendas) {
              totalGains += parseFloat(vendas[id].valor);
          }
      }

      res.json({
          totalGains: totalGains.toFixed(2),
          totalCount: totalCount
      });
  } catch (error) {
      console.error('Erro ao calcular métricas:', error);
      res.status(500).json({ error: 'Erro ao calcular métricas' });
  }
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
