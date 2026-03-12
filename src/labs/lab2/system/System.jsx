import { useState, useEffect, useRef } from "react"
import functionPlot from "function-plot"
import katex from "katex"
import "katex/dist/katex.min.css"
import "./System.css"

function parseFn2(str) {
    try { return new Function("x", "y", `with(Math) { return ${str.replace(/\^/g, "**")} }`) }
    catch { return null }
}

function System() {
    const [systems, setSystems] = useState([])
    const [sysLoading, setSysLoading] = useState(true)
    const [sysError, setSysError] = useState(null)
    const [selectedSysId, setSelectedSysId] = useState(0)
    const [x0, setX0] = useState("0.5")
    const [y0, setY0] = useState("0.5")
    const [eps, setEps] = useState("0.0001")
    const [validationError, setValidationError] = useState(null)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [serverError, setServerError] = useState(null)
    const plotRef = useRef(null)
    const fileRef = useRef(null)

    useEffect(() => {
        fetch("/api/lab/2/systems")
            .then(r => r.json())
            .then(data => { setSystems(data); setSysLoading(false) })
            .catch(e => { setSysError(e.message); setSysLoading(false) })
    }, [])

    useEffect(() => {
        if (!plotRef.current || systems.length === 0) return
        const sys = systems.find((s, i) => (s.systemInfoId ?? i) === selectedSysId)
        if (!sys) return

        const cx = result?.lab2SystemIsSuccess ? result.lab2SystemRoot[0] : parseFloat(x0) || 0
        const cy = result?.lab2SystemIsSuccess ? result.lab2SystemRoot[1] : parseFloat(y0) || 0
        const R = 3

        const colors = ["#0000ee", "#bc1010"]
        const data = (sys.systemInfoStrings ?? []).map((fn, i) => ({
            fn, fnType: "implicit", color: colors[i],
        }))

        if (result?.lab2SystemIsSuccess) {
            data.push({ points: [[result.lab2SystemRoot[0], result.lab2SystemRoot[1]]], fnType: "points", color: "#008800" })
        }
        data.push({ points: [[parseFloat(x0) || 0, parseFloat(y0) || 0]], fnType: "points", color: "#888" })

        try {
            functionPlot({
                target: plotRef.current,
                width: plotRef.current.clientWidth,
                height: 360,
                xAxis: { domain: [cx - R, cx + R] },
                yAxis: { domain: [cy - R, cy + R] },
                data,
            })
        } catch (_) {}
    }, [systems, selectedSysId, x0, y0, result])

    const handleSubmit = async () => {
        const nx = parseFloat(x0), ny = parseFloat(y0), neps = parseFloat(eps)
        if (isNaN(nx))        { setValidationError("x₀ — не число"); return }
        if (isNaN(ny))        { setValidationError("y₀ — не число"); return }
        if (isNaN(neps))      { setValidationError("ε — не число"); return }
        if (neps <= 0)        { setValidationError("ε должно быть > 0"); return }
        if (neps >= 1)        { setValidationError("ε должно быть < 1"); return }
        setValidationError(null)
        setLoading(true); setServerError(null); setResult(null)
        try {
            const resp = await fetch("/api/lab/2/system", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lab2SystemId: selectedSysId,
                    lab2InitialGuess: [parseFloat(x0), parseFloat(y0)],
                    lab2SystemEps: parseFloat(eps)
                })
            })
            setResult((await resp.json()).lab2SystemPayload)
        } catch (e) { setServerError(e.message) }
        finally { setLoading(false) }
    }

    const handleFileLoad = (e) => {
        const file = e.target.files[0]; if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            const nums = ev.target.result.trim().replace(/(\d),(\d)/g, '$1.$2').split(/[\s,\n]+/).map(Number)
            if (nums.length >= 3 && !nums.some(isNaN)) {
                setX0(String(nums[0])); setY0(String(nums[1])); setEps(String(nums[2]))
                setValidationError(null)
            } else {
                setValidationError("Файл должен содержать 3 числа: x0 y0 eps")
            }
        }
        reader.readAsText(file); e.target.value = ""
    }

    if (sysLoading) return <div className="system-status">[ LOADING SYSTEMS... ]</div>
    if (sysError)   return <div className="system-status system-status--error">!! ERROR: {sysError}</div>

    const selectedSys = systems.find((s, i) => (s.systemInfoId ?? i) === selectedSysId)
    // Parse fns from server strings for verification display
    const parsedFns = (selectedSys?.systemInfoStrings ?? []).map(s => parseFn2(s))

    return (
        <div className="system-wrapper">
            <div className="system-section-title">--- СИСТЕМЫ НЕЛИНЕЙНЫХ УРАВНЕНИЙ ---</div>
            <div className="system-layout">
                <div className="system-left">

                    <p>[SYSTEM]:</p>
                    {systems.map((sys, idx) => {
                        const sysId = sys.systemInfoId ?? idx
                        const latex = katex.renderToString(sys.systemInfoLatex ?? "", { throwOnError: false })
                        return (
                            <label key={sysId} className="system-eq-option">
                                <input type="radio" name="system-eq"
                                    checked={selectedSysId === sysId}
                                    onChange={() => { setSelectedSysId(sysId); setResult(null) }} />
                                <span dangerouslySetInnerHTML={{ __html: latex }} />
                            </label>
                        )
                    })}

                    <p>[INITIAL GUESS]:</p>
                    <div className="system-inputs">
                        <label>x₀: <input className="retro-input" type="number" step="0.01" value={x0} onChange={e => { setX0(e.target.value); setValidationError(null) }} />
                        </label>
                        <label>y₀: <input className="retro-input" type="number" step="0.01" value={y0} onChange={e => { setY0(e.target.value); setValidationError(null) }} />
                        </label>
                        <label>ε: <input className="retro-input" type="number" step="0.01" value={eps} onChange={e => { setEps(e.target.value); setValidationError(null) }} />
                        </label>
                    </div>

                    <div className="system-file-row">
                        <span>or load from file (x0 y0 eps):</span>
                        <input ref={fileRef} type="file" accept=".txt" style={{ display: "none" }} onChange={handleFileLoad} />
                        <button className="retro-btn" onClick={() => fileRef.current?.click()}>[ OPEN FILE ]</button>
                    </div>

                    {validationError && <div className="system-validation-error">!! {validationError}</div>}

                    <button className="retro-btn retro-btn--primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? "[ CALCULATING... ]" : "[ RUN SOLVER ]"}
                    </button>

                    {serverError && (
                        <div className="system-output status-error">
                            <div className="output-section-title">!! SYSTEM_ERROR !!</div>
                            <p>{serverError}</p>
                        </div>
                    )}

                    {result && (
                        <div className={`system-output ${result.lab2SystemIsSuccess ? "status-success" : "status-error"}`}>
                            <div className="output-section-title">
                                {result.lab2SystemIsSuccess ? "--- CALCULATION_SUCCESS ---" : "--- CALCULATION_FAILED ---"}
                            </div>
                            {result.lab2SystemIsSuccess ? (
                                <>
                                    <p>SOLUTION_VECTOR:</p>
                                    {result.lab2SystemRoot.map((v, i) => (
                                        <div key={i} className="stat-line">x{i+1}: <strong>{v.toFixed(10)}</strong></div>
                                    ))}
                                    <p style={{ marginTop: 10 }}>ERROR_VECTOR:</p>
                                    {result.lab2SystemErrVector.map((v, i) => (
                                        <div key={i} className="stat-line">|Δx{i+1}|: <strong>{v.toFixed(10)}</strong></div>
                                    ))}
                                    <p style={{ marginTop: 10 }}>VERIFICATION:</p>
                                    {parsedFns.map((fn, i) => fn && (
                                        <div key={i} className="stat-line">
                                            f{i+1}(root): <strong>{fn(result.lab2SystemRoot[0], result.lab2SystemRoot[1]).toFixed(10)}</strong>
                                        </div>
                                    ))}
                                    <div className="stat-line" style={{ marginTop: 10 }}>ITERS: <strong>{result.lab2SystemIters}</strong></div>
                                </>
                            ) : (
                                <p>{result.lab2SystemErrMessage}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="system-right">
                    <p>[GRAPH]:</p>
                    <div ref={plotRef} className="system-plot" />
                </div>
            </div>
        </div>
    )
}

export default System
