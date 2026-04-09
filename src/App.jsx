import { useState, useEffect } from 'react'

const SAMPLE_DATA = [
  { category: 'Vanity', name: '36" White Shaker' },
  { category: 'Vanity', name: '48" Gray Flat Panel' },
  { category: 'Countertop', name: 'White Quartz' },
  { category: 'Countertop', name: 'Gray Granite' },
  { category: 'Sink', name: 'White Undermount Rectangle' },
  { category: 'Sink', name: 'Biscuit Vessel Oval' },
]

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

function Setup({ onSave }) {
  const [url, setUrl] = useState('')

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Setup</h1>
      <p className="mb-4 text-gray-600">
        Paste your Google Sheet URL below, or use sample data to try it out.
      </p>

      <div className="mb-6 p-4 bg-gray-50 border text-sm">
        <p className="font-medium mb-2">How to get the URL:</p>
        <ol className="list-decimal ml-4 space-y-2">
          <li>Open your Google Sheet</li>
          <li>Go to <strong>File → Share → Publish to web</strong></li>
          <li>In the first dropdown, select your sheet name (or "Entire document")</li>
          <li>In the second dropdown, change "Web page" to <strong>"Comma-separated values (.csv)"</strong></li>
          <li>Click the green <strong>Publish</strong> button</li>
          <li>Copy the URL that appears</li>
        </ol>
        <p className="mt-3 text-gray-500">
          Your sheet needs columns: <strong>category</strong> and <strong>name</strong>
        </p>
      </div>

      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
        className="w-full p-3 border mb-4"
      />

      <div className="flex gap-3">
        <button
          onClick={() => onSave(url)}
          disabled={!url}
          className={`px-4 py-2 ${url ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}
        >
          Save & Continue
        </button>
        <button
          onClick={() => onSave('SAMPLE')}
          className="px-4 py-2 border"
        >
          Use Sample Data
        </button>
      </div>
    </div>
  )
}

function App() {
  const [sheetUrl, setSheetUrl] = useState(localStorage.getItem('sheetUrl') || '')
  const [data, setData] = useState([])
  const [categories, setCategories] = useState([])
  const [step, setStep] = useState(0)
  const [selections, setSelections] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadData = (url) => {
    if (url === 'SAMPLE') {
      setData(SAMPLE_DATA)
      setCategories([...new Set(SAMPLE_DATA.map(item => item.category))])
      return
    }

    setLoading(true)
    setError('')
    // Use CORS proxy to fetch Google Sheets
    const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url)
    fetch(proxyUrl)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch')
        return r.text()
      })
      .then(text => {
        const parsed = parseCSV(text)
        if (!parsed.length || !parsed[0].category) {
          throw new Error('Sheet must have a "category" column')
        }
        setData(parsed)
        setCategories([...new Set(parsed.map(item => item.category))])
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message || 'Failed to load sheet')
        setLoading(false)
      })
  }

  useEffect(() => {
    if (sheetUrl) loadData(sheetUrl)
  }, [sheetUrl])

  const saveUrl = (url) => {
    localStorage.setItem('sheetUrl', url)
    setSheetUrl(url)
  }

  const resetSetup = () => {
    localStorage.removeItem('sheetUrl')
    setSheetUrl('')
    setData([])
    setCategories([])
    setStep(0)
    setSelections({})
  }

  if (!sheetUrl) return <Setup onSave={saveUrl} />
  if (loading) return <div className="p-8">Loading...</div>
  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button onClick={resetSetup} className="px-4 py-2 border">
          Try Again
        </button>
      </div>
    )
  }

  const currentCategory = categories[step]
  const options = data.filter(item => item.category === currentCategory)
  const isLastStep = step === categories.length - 1
  const showSummary = step >= categories.length

  const select = (item) => setSelections({ ...selections, [currentCategory]: item })
  const next = () => setStep(step + 1)
  const back = () => setStep(step - 1)
  const reset = () => { setStep(0); setSelections({}) }

  if (showSummary) {
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
          <button onClick={() => window.print()} className="px-4 py-2 bg-black text-white">Print</button>
        </div>
        <button onClick={resetSetup} className="mt-8 text-sm text-gray-400">
          Change Sheet
        </button>
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

      <button onClick={resetSetup} className="mt-8 text-sm text-gray-400">
        Change Sheet
      </button>
    </div>
  )
}

export default App
