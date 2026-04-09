import { useState, useEffect } from 'react'

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5CE3XMO-diSitsN-yyci7VW2tFFglTr6x44nLccdc-jxvOHSfGL0LUl1LaZSiuwpkK6N92bKlI2li/pub?output=csv'

function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i] || ''
      return obj
    }, {})
  })
}

function App() {
  const [data, setData] = useState([])
  const [categories, setCategories] = useState([])
  const [step, setStep] = useState(0)
  const [selections, setSelections] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/sheet?url=' + encodeURIComponent(SHEET_URL))
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch')
        return r.text()
      })
      .then(text => {
        const parsed = parseCSV(text)
        setData(parsed)
        setCategories([...new Set(parsed.map(item => item.category))])
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'Failed to load')
        setLoading(false)
      })
  }, [])
  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>

  const currentCategory = categories[step]
  const options = data.filter(item => item.category === currentCategory)
  const isLastStep = step === categories.length - 1
  const showSummary = step >= categories.length

  const select = (item) => setSelections({ ...selections, [currentCategory]: item })
  const next = () => setStep(step + 1)
  const back = () => setStep(step - 1)
  const reset = () => { setStep(0); setSelections({}) }

  if (showSummary) {
    const downloadCSV = () => {
      const csv = "Category,Selection\n" + Object.entries(selections).map(([cat, item]) => `${cat},"${item.name}"`).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'selections.csv'
      a.click()
    }

    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Summary</h1>
        <table className="w-full border-collapse mb-6">
          <tbody>
            {Object.entries(selections).map(([cat, item]) => (
              <tr key={cat} className="border-b">
                <td className="py-2 font-medium">{cat}</td>
                <td className="py-2">{item.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-4">
          <button onClick={reset} className="px-4 py-2 border">Start Over</button>
          <button onClick={downloadCSV} className="px-4 py-2 bg-black text-white">Download CSV</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-4 text-sm text-gray-500">
        Step {step + 1} of {categories.length}
      </div>

      <h1 className="text-2xl font-bold mb-6">Select {currentCategory}</h1>

      <div className="grid gap-3 mb-6">
        {options.map((item, i) => (
          <button
            key={i}
            onClick={() => select(item)}
            className={`p-4 border text-left ${
              selections[currentCategory]?.name === item.name
                ? 'border-black bg-gray-100'
                : 'border-gray-300'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        {step > 0 && (
          <button onClick={back} className="px-4 py-2 border">Back</button>
        )}
        <button
          onClick={next}
          disabled={!selections[currentCategory]}
          className={`px-4 py-2 ${
            selections[currentCategory] ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'
          }`}
        >
          {isLastStep ? 'View Summary' : 'Next'}
        </button>
      </div>

    </div>
  )
}

export default App
