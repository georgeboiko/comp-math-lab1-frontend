import { useState, useEffect, useRef } from "react"
import functionPlot from "function-plot"
import katex from "katex"
import "katex/dist/katex.min.css"
import "./Iters.css"

function validate(a, b, eps) {
    const na = parseFloat(a), nb = parseFloat(b), neps = parseFloat(eps)
    if (isNaN(na))   return "a — не число"
    if (isNaN(nb))   return "b — не число"
    if (isNaN(neps)) return "ε — не число"
    if (na >= nb)    return "a должно быть меньше b"
    if (neps <= 0)   return "ε должно быть > 0"
    if (neps >= 1)   return "ε должно быть < 1"
    return null
}

function Iters() {
    const [equations, setEquations] = useState([])
    const [eqLoading, setEqLoading] = useState(true)
    const [eqError, setEqError] = useState(null)
    const [selectedEqId, setSelectedEqId] = useState(0)
    const [a, setA] = useState("-3")
    const [b, setB] = useState("0")
    const [eps, setEps] = useState("0.0001")
    const [validationError, setValidationError] = useState(null)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [serverError, setServerError] = useState(null)
    const plotRef = useRef(null)
    const fileRef = useRef(null)

    useEffect(() => {
        fetch("/api/lab/2/equations")
            .then(r => r.json())
            .then(data => { setEquations(data); setEqLoading(false) })
            .catch(e => { setEqError(e.message); setEqLoading(false) })
    }, [])

    useEffect(() => {
        if (!plotRef.current || equations.length === 0) return
        const eq = equations.find((e, i) => (e.equationId ?? i) === selectedEqId) ?? equations[0]
        const xMin = parseFloat(a) - 1, xMax = parseFloat(b) + 1
        const annotations = result?.lab2IsSuccess
            ? [{ x: result.lab2Root, text: `root ≈ ${result.lab2Root.toFixed(6)}` }]
            : []
        try {
            functionPlot({
                target: plotRef.current,
                width: plotRef.current.clientWidth,
                height: 300,
                xAxis: { domain: [xMin, xMax] },
                annotations,
                data: [{ fn: eq.equationString, color: "#0000ee" }],
            })
        } catch (_) {}
    }, [equations, selectedEqId, a, b, result])

    const handleSubmit = async () => {
        const err = validate(a, b, eps)
        if (err) { setValidationError(err); return }
        setValidationError(null)
        setLoading(true); setServerError(null); setResult(null)
        try {
            const resp = await fetch("/api/lab/2/iters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lab2EquationId: selectedEqId, lab2A: parseFloat(a), lab2B: parseFloat(b), lab2Eps: parseFloat(eps) })
            })
            setResult((await resp.json()).lab2Payload)
        } catch (e) { setServerError(e.message) }
        finally { setLoading(false) }
    }

    const handleFileLoad = (e) => {
        const file = e.target.files[0]; if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            const nums = ev.target.result.trim().replace(/(\d),(\d)/g, '$1.$2').split(/[\s,\n]+/).map(Number)
            if (nums.length >= 3 && !nums.some(isNaN)) {
                setA(String(nums[0])); setB(String(nums[1])); setEps(String(nums[2]))
                setValidationError(null)
            } else {
                setValidationError("Файл должен содержать 3 числа: a b eps")
            }
        }
        reader.readAsText(file); e.target.value = ""
    }

    if (eqLoading) return <div className="iters-status">[ LOADING EQUATIONS... ]</div>
    if (eqError)   return <div className="iters-status iters-status--error">!! ERROR: {eqError}</div>

    return (
        <div className="iters-wrapper">
            <div className="iters-section-title">--- МЕТОД ПРОСТЫХ ИТЕРАЦИЙ ---</div>
            <div className="iters-layout">
                <div className="iters-left">
                    <p>[EQUATION]:</p>
                    {equations.map((eq, idx) => {
                        const eqId = eq.equationId ?? idx
                        const latex = katex.renderToString((eq.equationLatex ?? eq.equationString) + " = 0", { throwOnError: false })
                        return (
                            <label key={eqId} className="iters-eq-option">
                                <input type="radio" name="iters-eq"
                                    checked={selectedEqId === eqId}
                                    onChange={() => { setSelectedEqId(eqId); setResult(null) }} />
                                <span dangerouslySetInnerHTML={{ __html: latex }} />
                            </label>
                        )
                    })}

                    <p>[INPUT]:</p>
                    <div className="iters-inputs">
                        <label>x₀: <input className="retro-input" type="number" step="0.01" value={a} onChange={e => { setA(e.target.value); setValidationError(null) }} /></label>
                        <label>x₁: <input className="retro-input" type="number" step="0.01" value={b} onChange={e => { setB(e.target.value); setValidationError(null) }} /></label>
                        <label>ε: <input className="retro-input" type="number" step="0.01" value={eps} onChange={e => { setEps(e.target.value); setValidationError(null) }} /></label>
                    </div>

                    <div className="iters-file-row">
                        <span>or load from file (a b eps):</span>
                        <input ref={fileRef} type="file" accept=".txt" style={{ display: "none" }} onChange={handleFileLoad} />
                        <button className="retro-btn" onClick={() => fileRef.current?.click()}>[ OPEN FILE ]</button>
                    </div>

                    {validationError && <div className="iters-validation-error">!! {validationError}</div>}

                    <button className="retro-btn retro-btn--primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? "[ CALCULATING... ]" : "[ RUN SOLVER ]"}
                    </button>

                    {serverError && (
                        <div className="iters-output status-error">
                            <div className="output-section-title">!! SYSTEM_ERROR !!</div>
                            <p>{serverError}</p>
                        </div>
                    )}

                    {result && (
                        <div className={`iters-output ${result.lab2IsSuccess ? "status-success" : "status-error"}`}>
                            <div className="output-section-title">
                                {result.lab2IsSuccess ? "--- CALCULATION_SUCCESS ---" : "--- CALCULATION_FAILED ---"}
                            </div>
                            {result.lab2IsSuccess ? (
                                <>
                                    <div className="stat-line">ROOT    : <strong>{result.lab2Root.toFixed(10)}</strong></div>
                                    <div className="stat-line">f(root) : <strong>{result.lab2Value.toFixed(10)}</strong></div>
                                    <div className="stat-line">ITERS   : <strong>{result.lab2Iters}</strong></div>
                                </>
                            ) : (
                                <p>{result.lab2ErrMessage}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="iters-right">
                    <p>[GRAPH]:</p>
                    <div ref={plotRef} className="iters-plot" />
                </div>
            </div>
        </div>
    )
}

export default Iters
