import { useState, useEffect } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"
import "../shared/IntegralForm.css"

function validate(a, b, eps) {
    const na = parseFloat(a), nb = parseFloat(b), neps = parseFloat(eps)
    if (isNaN(na))   return "a — не число"
    if (isNaN(nb))   return "b — не число"
    if (isNaN(neps)) return "ε — не число"
    if (neps <= 0)   return "ε должно быть > 0"
    if (neps >= 1)   return "ε должно быть < 1"
    return null
}

function IntegralForm({ title, endpoints }) {
    const [functions, setFunctions] = useState([])
    const [fnLoading, setFnLoading] = useState(true)
    const [fnError, setFnError]     = useState(null)
    const [selectedFnId, setSelectedFnId] = useState(0)
    const [a, setA]   = useState("0")
    const [b, setB]   = useState("2")
    const [eps, setEps] = useState("0.001")
    const [validationError, setValidationError] = useState(null)

    const [results, setResults]   = useState({})
    const [loadings, setLoadings] = useState({})
    const [errors, setErrors]     = useState({})

    useEffect(() => {
        fetch("/api/lab/3/integrals")
            .then(r => r.json())
            .then(data => { setFunctions(data); setFnLoading(false) })
            .catch(e  => { setFnError(e.message); setFnLoading(false) })
    }, [])

    const handleSubmit = async () => {
        const err = validate(a, b, eps)
        if (err) { setValidationError(err); return }
        setValidationError(null)

        const body = JSON.stringify({
            lab3FunctionId: selectedFnId,
            lab3A: parseFloat(a),
            lab3B: parseFloat(b),
            lab3Eps: parseFloat(eps),
        })

        const newLoadings = {}
        endpoints.forEach(ep => { newLoadings[ep.key] = true })
        setLoadings(newLoadings)
        setResults({})
        setErrors({})

        await Promise.all(endpoints.map(async (ep) => {
            try {
                const resp = await fetch(ep.url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body,
                })
                const json = await resp.json()
                setResults(prev => ({ ...prev, [ep.key]: json.lab3Payload }))
            } catch (e) {
                setErrors(prev => ({ ...prev, [ep.key]: e.message }))
            } finally {
                setLoadings(prev => ({ ...prev, [ep.key]: false }))
            }
        }))
    }

    const anyLoading = Object.values(loadings).some(Boolean)

    if (fnLoading) return <div className="integral-status">[ LOADING FUNCTIONS... ]</div>
    if (fnError)   return <div className="integral-status integral-status--error">!! ERROR: {fnError}</div>

    return (
        <div className="integral-wrapper">
            <div className="integral-section-title">--- {title} ---</div>
            <div className="integral-layout">
                <div className="integral-left">
                    <p>[FUNCTION]:</p>
                    {functions.map((fn, idx) => {
                        const fnId = fn.integralId ?? idx
                        const latex = katex.renderToString(
                            "\\int_a^b " + (fn.integralLatex ?? fn.integralString) + "\\,dx",
                            { throwOnError: false }
                        )
                        return (
                            <label key={fnId} className="integral-fn-option">
                                <input
                                    type="radio"
                                    name={`integral-fn-${title}`}
                                    checked={selectedFnId === fnId}
                                    onChange={() => { setSelectedFnId(fnId); setResults({}); setErrors({}) }}
                                />
                                <span dangerouslySetInnerHTML={{ __html: latex }} />
                            </label>
                        )
                    })}

                    <p>[INPUT]:</p>
                    <div className="integral-inputs">
                        <label>a: <input className="retro-input" type="number" step="0.1" value={a} onChange={e => { setA(e.target.value); setValidationError(null) }} /></label>
                        <label>b: <input className="retro-input" type="number" step="0.1" value={b} onChange={e => { setB(e.target.value); setValidationError(null) }} /></label>
                        <label>ε: <input className="retro-input" type="number" step="0.00001" value={eps} onChange={e => { setEps(e.target.value); setValidationError(null) }} /></label>
                    </div>

                    {validationError && (
                        <div className="integral-validation-error">!! {validationError}</div>
                    )}

                    <button
                        className="retro-btn retro-btn--primary"
                        onClick={handleSubmit}
                        disabled={anyLoading}
                    >
                        {anyLoading ? "[ CALCULATING... ]" : "[ RUN SOLVER ]"}
                    </button>
                </div>

                <div className="integral-right">
                    <p>[RESULTS]:</p>
                    {endpoints.map(ep => {
                        const result  = results[ep.key]
                        const loading = loadings[ep.key]
                        const error   = errors[ep.key]

                        return (
                            <div key={ep.key} className="integral-result-block">
                                <div className="integral-result-label">{ep.label}</div>

                                {loading && (
                                    <div className="integral-status">[ CALCULATING... ]</div>
                                )}

                                {error && !loading && (
                                    <div className="integral-output status-error">
                                        <div className="output-section-title">!! SYSTEM_ERROR !!</div>
                                        <p>{error}</p>
                                    </div>
                                )}

                                {result && !loading && (
                                    <div className={`integral-output ${result.lab3IsSuccess ? "status-success" : "status-error"}`}>
                                        <div className="output-section-title">
                                            {result.lab3IsSuccess ? "--- SUCCESS ---" : "--- FAILED ---"}
                                        </div>
                                        {result.lab3IsSuccess ? (
                                            <>
                                                <div className="stat-line">INTEGRAL : <strong>{result.lab3CalculatedIntegral.toFixed(10)}</strong></div>
                                                <div className="stat-line">ERROR    : <strong>{result.lab3ErrValue.toFixed(10)}</strong></div>
                                                <div className="stat-line">PARTS    : <strong>{result.lab3PartsCount}</strong></div>
                                                {result.lab3Message && (
                                                    <div className="stat-line">MSG      : <strong>{result.lab3Message}</strong></div>
                                                )}
                                            </>
                                        ) : (
                                            <p>{result.lab3Message}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default IntegralForm