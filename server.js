const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');
const app = express();
// const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));


// Inicializa o Firebase Admin SDK

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://financecontrol-c2228-default-rtdb.firebaseio.com/'
  });
} catch (error) {
  console.error('Firebase initialization error:', error);
  process.exit(1);
}


// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount), databaseURL: 'https://financecontrol-c2228-default-rtdb.firebaseio.com/' });



const db = admin.database();
// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});



// Endpoint para adicionar uma venda
app.post('/add-sale', (req, res) => {
  const { nome, data, tipo, cupom, valor } = req.body;
  const saleRef = db.ref('vendas').push(); // Cria uma nova entrada no Firebase
  saleRef.set({ nome, data, tipo, cupom, valor })
    .then(() => {
      res.send({ id: saleRef.key }); // Retorna o ID gerado pelo Firebase
    })
    .catch((err) => {
      console.error('Erro ao adicionar venda:', err);
      res.status(500).json({ error: 'Erro ao adicionar venda' });
    });
});

// Endpoint para buscar todas as vendas
app.get('/sales', (req, res) => {
  db.ref('vendas').once('value')
    .then((snapshot) => {
      const vendas = snapshot.val();
      res.json(vendas ? Object.values(vendas) : []); // Retorna um array de vendas
    })
    .catch((err) => {
      console.error('Erro ao buscar vendas:', err);
      res.status(500).json({ error: 'Erro ao buscar vendas' });
    });
});

// Endpoint para calcular métricas
app.get('/metrics', (req, res) => {
  db.ref('vendas').once('value')
    .then((snapshot) => {
      const vendas = snapshot.val();
      let totalGains = 0;
      let totalCount = 0;

      if (vendas) {
        totalCount = Object.keys(vendas).length;
        Object.values(vendas).forEach((venda) => {
          totalGains += parseFloat(venda.valor || 0); // Supondo que cada venda tenha um campo "valor"
        });
      }

      res.json({
        totalGains: totalGains.toFixed(2),
        totalCount: totalCount
      });
    })
    .catch((err) => {
      console.error('Erro ao calcular métricas:', err);
      res.status(500).json({ error: 'Erro ao calcular métricas' });
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});