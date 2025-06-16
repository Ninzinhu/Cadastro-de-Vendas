document.getElementById('sale-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const data = new Date(document.getElementById('data').value).toISOString();
    const tipo = document.getElementById('tipo').value;
    const cupom = document.getElementById('cupom').value;
    const valor = document.getElementById('valor').value;

    

    fetch('/add-sale', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, data, tipo, cupom, valor })
    })
    .then(response => response.json())
    .then(data => {
        addSaleToTable({ id: data.id, nome, data, tipo, cupom, valor });
        document.getElementById('sale-form').reset();

    

        // Mostrar notificação
        showNotification(
            'Venda Cadastrada! ✅🎉',
            `Cliente: ${nome} | R$ ${parseFloat(valor).toFixed(2)}`, 3000
        );

        // Recarregar após 3 segundos (opcional)
        setTimeout(() => {
            location.reload();
        }, 1000);
    })
    .catch(error => {
        showNotification(
            'Erro ao cadastrar! ❌',
            'Ocorreu um problema ao salvar os dados'
        );
    });
});


function showNotification(title, message) {
    // Criar elemento da notificação se não existir
    let notification = document.querySelector('.notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        
        const titleElement = document.createElement('div');
        titleElement.className = 'notification-title';
        
        const messageElement = document.createElement('div');
        messageElement.className = 'notification-message';
        
        notification.appendChild(titleElement);
        notification.appendChild(messageElement);
        document.body.appendChild(notification);
    }
    
    // Preencher conteúdo
    notification.querySelector('.notification-title').textContent = title;
    notification.querySelector('.notification-message').textContent = message;
    
    // Mostrar notificação
    notification.classList.add('show');
    
    // Esconder após 3 segundo
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Remover completamente após a animação (opcional)
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

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
  const cell5 = newRow.insertCell(4);

  cell1.textContent = sale.nome; 
  cell2.textContent = new Date(sale.data).toLocaleDateString();
  cell3.textContent = sale.tipo;
  cell4.textContent = sale.cupom;
  cell5.textContent = sale.valor;


}




function updateMetrics() {
  fetch('/metrics')
    .then(response => response.json())
    .then(metrics => {
      document.getElementById('total-gains').textContent = `Total Gains: $${metrics.totalGains}`;
      document.getElementById('total-count').textContent = `Total Sales: ${metrics.totalCount}`;
    });
}



document.getElementById('download-button').addEventListener('click', function() {
    const table = document.getElementById('sales-table');
    const rows = table.querySelectorAll('tr');
    let csvContent = '';

    // Cabeçalho (nomes das colunas)
    const headerRow = rows[0];
    const headerCells = headerRow.querySelectorAll('th, td');
    const headers = Array.from(headerCells).map(cell => cell.textContent);
    csvContent += headers.join(',') + '\n';

    // Dados das linhas
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('td');
        const rowData = Array.from(cells).map(cell => cell.textContent);
        csvContent += rowData.join(',') + '\n';
    }

    // Criar arquivo e forçar download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'vendas.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});


document.addEventListener('DOMContentLoaded', function() {
    // Variáveis globais
    let sales = [];
    let salesChart = null;

    // Elementos do DOM
    const saleForm = document.getElementById('sale-form');
    const metricsBtn = document.getElementById('metrics-btn');
    const modal = document.getElementById('metrics-modal');
    const closeModal = document.querySelector('.close-modal');
    const downloadBtn = document.getElementById('download-button');
    const salesTable = document.getElementById('sales-table').getElementsByTagName('tbody')[0];
    const totalGainsElement = document.getElementById('total-gains');
    const totalSalesElement = document.getElementById('total-sales');
    const salesByTypeElement = document.getElementById('sales-by-type');
    const salesChartCtx = document.getElementById('sales-chart').getContext('2d');

    // // Inicialização
    loadSales();

    // Event Listeners
    saleForm.addEventListener('submit', handleSaleSubmit);
    metricsBtn.addEventListener('click', openMetricsModal);
    closeModal.addEventListener('click', closeMetricsModal);
    downloadBtn.addEventListener('click', downloadSpreadsheet);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeMetricsModal();
        }
    });

    // Funções

    // // Carrega vendas do localStorage
    function loadSales() {
        const savedSales = localStorage.getItem('sales');
        if (savedSales) {
            sales = JSON.parse(savedSales);
            
            updateMetrics();
        }
    }

    // // Atualiza a tabela de vendas
    // function updateSalesTable() {
    //     salesTable.innerHTML = '';
    //     sales.forEach(sale => {
    //         const row = salesTable.insertRow();
    //         row.innerHTML = `
    //             <td>${sale.nome}</td>
    //             <td>${formatDate(sale.data)}</td>
    //             <td>${sale.tipo}</td>
    //             <td>${formatCurrency(sale.valor)}</td>
    //         `;
    //     });
    // }

    function formatCurrency(value) {
    return `R$ ${parseFloat(value).toFixed(2)}`;
}

    // Formata data para exibição
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    // Atualiza as métricas
    function updateMetrics() {
        // Calcula total de ganhos
        const totalGains = sales.reduce((sum, sale) => sum + sale.valor, 0);
        totalGainsElement.textContent = `Total: R$ ${totalGains.toFixed(2)}`;

        // Atualiza estatísticas no modal se estiver aberto
        if (modal.style.display === 'block') {
            updateChartAndStats();
        }
    }

    // Atualiza gráfico e estatísticas
    function updateChartAndStats() {
        // Agrupa vendas por tipo
        const salesByType = {};
        sales.forEach(sale => {
            if (!salesByType[sale.tipo]) {
                salesByType[sale.tipo] = 0;
            }
            salesByType[sale.tipo] += sale.valor;
        });

        // Atualiza total de vendas
        totalSalesElement.textContent = sales.length;

        // Atualiza lista de vendas por tipo
        salesByTypeElement.innerHTML = '';
        for (const [type, total] of Object.entries(salesByType)) {
            const li = document.createElement('li');
            li.textContent = `${type}: R$ ${total.toFixed(2)}`;
            salesByTypeElement.appendChild(li);
        }

        // Atualiza ou cria o gráfico
        const labels = Object.keys(salesByType);
        const data = Object.values(salesByType);

        if (salesChart) {
            salesChart.data.labels = labels;
            salesChart.data.datasets[0].data = data;
            salesChart.update();
        } else {
            salesChart = new Chart(salesChartCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Vendas por Tipo (R$)',
                        data: data,
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(153, 102, 255, 0.6)'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 99, 132, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    // Manipulador do formulário
    function handleSaleSubmit(event) {
        event.preventDefault();

        const nome = document.getElementById('nome').value;
        const data = new Date(document.getElementById('data').value).toISOString();
        const tipo = document.getElementById('tipo').value;
        const valor = parseFloat(document.getElementById('valor').value);

        // Cria nova venda
        const newSale = {
            id: Date.now(),
            nome,
            data,
            tipo,
            valor
        };

        // Adiciona à lista e salva
        sales.push(newSale);
        localStorage.setItem('sales', JSON.stringify(sales));

        // Atualiza a UI
        addSaleToTable(newSale);
        updateMetrics();
        saleForm.reset();
    }

    // Adiciona venda à tabela
    function addSaleToTable(sale) {
        const row = salesTable.insertRow();
        row.innerHTML = `
            <td>${sale.nome}</td>
            <td>${formatDate(sale.data)}</td>
            <td>${sale.tipo}</td>
            <td>R$ ${sale.valor.toFixed(2)}</td>
        `;
    }

    // Abre o modal de métricas
    function openMetricsModal() {
        modal.style.display = 'block';
        updateChartAndStats();
    }

    // Fecha o modal de métricas
    function closeMetricsModal() {
        modal.style.display = 'none';
    }

    // Download da planilha
    function downloadSpreadsheet() {
        // Cria uma cópia da tabela para exportação
        const exportTable = document.createElement('table');
        const headerRow = exportTable.insertRow();
        
        // Adiciona cabeçalhos
        ['Nome', 'Data', 'Tipo', 'Valor'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });

        // Adiciona dados
        sales.forEach(sale => {
            const row = exportTable.insertRow();
            row.insertCell(0).textContent = sale.nome;
            row.insertCell(1).textContent = formatDate(sale.data);
            row.insertCell(2).textContent = sale.tipo;
            row.insertCell(3).textContent = `R$ ${sale.valor.toFixed(2)}`;
        });

        // Converte para planilha
        const workbook = XLSX.utils.table_to_book(exportTable);
        XLSX.writeFile(workbook, 'vendas.xlsx');
    }
});

// Carrega as vendas ao iniciar
loadSales();