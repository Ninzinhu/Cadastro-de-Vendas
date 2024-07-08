document.getElementById('sale-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const nome = document.getElementById('nome').value;
  const data = new Date(document.getElementById('data').value).toISOString();
  const tipo = document.getElementById('tipo').value;
  const cupom = document.getElementById('cupom').value;

  fetch('/add-sale', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, data, tipo, cupom })
  }).then(response => response.json())
  .then(data => {
      addSaleToTable({ id: data.id, nome, data, tipo, cupom });
      document.getElementById('sale-form').reset();
  });
});

function loadSales() {
  fetch('/sales')
  .then(response => response.json())
  .then(data => {
      data.forEach(sale => {
          addSaleToTable(sale);
      });
      updateMetrics();
  });
}

function addSaleToTable(sale) {
  const table = document.getElementById('sales-table').getElementsByTagName('tbody')[0];
  const newRow = table.insertRow();

  const cell1 = newRow.insertCell(0);
  const cell2 = newRow.insertCell(1);
  const cell3 = newRow.insertCell(2);
  const cell4 = newRow.insertCell(3);

  cell1.innerHTML = sale.nome;
  cell2.innerHTML = formatDate(sale.data);
  cell3.innerHTML = sale.tipo;
  cell4.innerHTML = sale.cupom;
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

document.addEventListener('DOMContentLoaded', loadSales);

document.getElementById('download-button').addEventListener('click', function() {
  const table = document.getElementById('sales-table');
  const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
  XLSX.writeFile(wb, 'sales.xlsx');
});
