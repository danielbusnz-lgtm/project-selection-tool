import { useState, useEffect } from 'react'

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwW2u8Eo-86Bp4yuK79Q0Ld0e_YH5bmjhKWJ_AutigTjKygszXfVD3C6nuwansX3of96bb7A9g0lVD/pub?output=csv'

function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  return lines.slice(1).map(line => {
    // Handle quoted values with commas
    const values = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') inQuotes = !inQuotes
      else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else current += char
    }
    values.push(current.trim())
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i] || ''
      return obj
    }, {})
  })
}

function App() {
  const [data, setData] = useState([])
  const [selections, setSelections] = useState([]) // Array of {category, name, parent}
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
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'Failed to load')
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>

  // Get current parent context (last selection's name, or empty for root)
  const currentParent = selections.length > 0 ? selections[selections.length - 1].name : ''

  // Get options for current level (items matching current parent)
  const currentOptions = data.filter(item => item.parent === currentParent)

  // Group by category
  const categories = [...new Set(currentOptions.map(item => item.category))]
  const currentCategory = categories[0] // Show first category at this level
  const options = currentOptions.filter(item => item.category === currentCategory)

  // Check if we're done (no more options)
  const showSummary = currentOptions.length === 0 && selections.length > 0

  const select = (item) => {
    setSelections([...selections, item])
  }

  const back = () => {
    setSelections(selections.slice(0, -1))
  }

  const reset = () => {
    setSelections([])
  }

  const downloadCSV = () => {
    const csv = "Category,Selection\n" + selections.map(s => `${s.category},"${s.name}"`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'selections.csv'
    a.click()
  }

  if (showSummary) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Summary</h1>
        <table className="w-full border-collapse mb-6">
          <tbody>
            {selections.map((item, i) => (
              <tr key={i} className="border-b">
                <td className="py-2 font-medium">{item.category}</td>
                <td className="py-2">{item.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-4">
          <button onClick={reset} className="px-4 py-2 border">Start Over</button>
          <button onClick={downloadCSV} className="px-4 py-2 border">Download CSV</button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-black text-white">Print</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {selections.length > 0 && (
        <div className="mb-4 text-sm text-gray-500">
          Path: {selections.map(s => s.name).join(' → ')}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Select {currentCategory}</h1>

      <div className="grid gap-3 mb-6">
        {options.map((item, i) => (
          <button
            key={i}
            onClick={() => select(item)}
            className="p-4 border border-gray-300 text-left hover:border-black hover:bg-gray-50"
          >
            {item.name}
          </button>
        ))}
      </div>

      {selections.length > 0 && (
        <button onClick={back} className="px-4 py-2 border">Back</button>
      )}
    </div>
  )
}

export default App
