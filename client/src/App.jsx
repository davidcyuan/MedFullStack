import { useState } from 'react'

function App() {
  const [insuranceId, setInsuranceId] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setResult(null)
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('http://localhost:3001/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insurance_id: insuranceId, symptoms }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
      } else {
        setResult(data)
      }
    } catch {
      setError('Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '48px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: 24 }}>Insurance Cost Estimator</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>Insurance ID</span>
          <input
            type="text"
            value={insuranceId}
            onChange={e => setInsuranceId(e.target.value)}
            placeholder="e.g. INS-001"
            required
            style={{ padding: '8px 10px', fontSize: 15, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>Symptoms</span>
          <textarea
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            placeholder="e.g. chest pain and shortness of breath"
            required
            rows={3}
            style={{ padding: '8px 10px', fontSize: 15, borderRadius: 4, border: '1px solid #ccc', resize: 'vertical' }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: 15,
            borderRadius: 4,
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Estimating…' : 'Get Estimate'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 24, padding: 16, borderRadius: 4, background: '#fee2e2', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ marginBottom: 4 }}>{result.patient_name}</h2>
          <p style={{ margin: '0 0 20px', color: '#555' }}>{result.plan_name}</p>

          {result.matched_codes.length === 0 ? (
            <p style={{ color: '#555' }}>No procedures matched your symptoms.</p>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '8px 0' }}>Code</th>
                    <th style={{ padding: '8px 0' }}>Description</th>
                    <th style={{ padding: '8px 0', textAlign: 'right' }}>Base Price</th>
                  </tr>
                </thead>
                <tbody>
                  {result.matched_codes.map(c => (
                    <tr key={c.code} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '8px 0', color: '#555', fontSize: 13 }}>{c.code}</td>
                      <td style={{ padding: '8px 0' }}>{c.description}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right' }}>${c.base_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderTop: '2px solid #111',
                fontWeight: 600,
                fontSize: 17,
              }}>
                <span>Estimated Out-of-Pocket Cost</span>
                <span>${result.total_estimated_cost.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default App
