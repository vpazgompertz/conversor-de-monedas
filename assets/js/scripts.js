document.addEventListener('DOMContentLoaded', () => {

  const clpValueInput = document.getElementById("valor-clp")
  const currencySelect = document.getElementById("moneda")
  const convertButton = document.getElementById("search-btn")
  const conversionResult = document.getElementById("resultado")
  const chartCanvas = document.getElementById("myChart")

  const getAllIndicators = async () => {
    try {
      const response = await fetch('https://mindicador.cl/api')
      return await response.json()
    } catch (error) {
      console.error(`Error: ${error}`)
      return null
    }
  }

  const loadCurrencyTypes = async () => {
    const indicators = await getAllIndicators()
    if (!indicators) return

    Object.values(indicators)
      .slice(3)
      .forEach(indicator => {
        currencySelect.innerHTML += `<option value="${indicator.codigo}">${indicator.nombre}</option>`
      })
  }

  const getCurrencyValue = async (selectedCurrency) => {
    const data = await getAllIndicators()
    if (!data) return null
    return data[selectedCurrency]?.valor
  };

let myChart

const updateChart = (labels, data) => {
  if (myChart) {
    myChart.destroy()
  }

  myChart = new Chart(chartCanvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: 'Currency Value',
        data: data,
        borderColor: 'rgb(75, 192, 192)',
      }]
    }
  })
}

  const fetchLast10DataByIndicator = async (selectedCurrency) => {
    try {
      const response = await fetch(`https://mindicador.cl/api/${selectedCurrency}`)
      const data = await response.json()

      const last10Data = data.serie.slice(0, 10).reverse().map((dato) => {
        return {
          date: dato.fecha.split('T')[0].split('-').reverse().join('-'),
          value: dato.valor
        };
      })

      return last10Data
    } catch (error) {
      console.error(`Error: ${error}`)
      return null
    }
  };

  convertButton.addEventListener('click', async () => {
    const currencyValue = await getCurrencyValue(currencySelect.value)
    const result = clpValueInput.value / currencyValue
    conversionResult.innerHTML = `Resultado: $ ${result.toFixed(2)}`

    const dataTipoMoneda = await fetchLast10DataByIndicator(currencySelect.value)
    const dates = dataTipoMoneda.map((moneda) => moneda.date)
    const values = dataTipoMoneda.map((moneda) => moneda.value)
    updateChart(dates, values)

    clpValueInput.value = ''
    clpValueInput.focus()
  })

  loadCurrencyTypes()
})


