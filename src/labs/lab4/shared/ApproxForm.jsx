import { useState, useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import "./ApproxForm.css"

Chart.register(...registerables)

const DEFAULT_POINTS = "1.0, 2.1\n2.0, 3.9\n3.0, 6.2\n4.0, 7.8\n5.0, 10.1\n6.0, 12.3\n7.0, 14.0\n8.0, 16.2"

function parsePoints(text) {
    const lines = text.trim().split("\n").filter(l => l.trim() !== "")
    const pts = []
    for (const line of lines) {
        const parts = line.split(/[\s,;]+/).filter(Boolean)
        if (parts.length < 2) return null
        const x = parseFloat(parts[0])
        const y = parseFloat(parts[1])
        if (isNaN(x) || isNaN(y)) return null
        pts.push([x, y])
    }
    return pts.length >= 2 ? pts : null
}

function fmt(n) {
    if (n === undefined || n === null) return "—"
    return Number(n).toFixed(6)
}

function r2Message(r2) {
    if (r2 === undefined || r2 === null || r2 < 0) return null
    if (r2 >= 0.95) return "Точная аппроксимация (R² ≥ 0.95)"
    if (r2 >= 0.75) return "Хорошая аппроксимация (0.75 ≤ R² < 0.95)"
    if (r2 >= 0.5)  return "Удовлетворительная аппроксимация (0.5 ≤ R² < 0.75)"
    return "Слабая аппроксимация (R² < 0.5)"
}

// Generate smooth curve points for the approximation
function buildCurvePoints(result, xs) {
    if (!result || !result.lab4IsSuccess) return []
    const name = result.lab4ApproxName ?? ""
    const c = result.lab4Coefficients ?? []
    const xMin = Math.min(...xs)
    const xMax = Math.max(...xs)
    const margin = (xMax - xMin) * 0.1 || 0.5
    const steps = 200
    const step = (xMax - xMin + 2 * margin) / steps
    const pts = []
    for (let i = 0; i <= steps; i++) {
        const x = xMin - margin + i * step
        let y = null
        if (name === "Linear" && c.length >= 2)
            y = c[0] * x + c[1]
        else if (name === "Quadratic" && c.length >= 3)
            y = c[0] + c[1] * x + c[2] * x * x
        else if (name === "Cubic" && c.length >= 4)
            y = c[0] + c[1] * x + c[2] * x * x + c[3] * x * x * x
        else if (name === "Exponential" && c.length >= 2)
            y = c[0] * Math.exp(c[1] * x)
        else if (name === "Logarithmic" && c.length >= 2 && x > 0)
            y = c[0] * Math.log(x) + c[1]
        else if (name === "Power" && c.length >= 2 && x > 0)
            y = c[0] * Math.pow(x, c[1])
        if (y !== null && isFinite(y)) pts.push({ x, y })
    }
    return pts
}

function ApproxChart({ result, xs, ys }) {
    const canvasRef = useRef(null)
    const chartRef  = useRef(null)

    useEffect(() => {
        if (!canvasRef.current || !result || !result.lab4IsSuccess) return

        if (chartRef.current) {
            chartRef.current.destroy()
            chartRef.current = null
        }

        const curvePts = buildCurvePoints(result, xs)

        chartRef.current = new Chart(canvasRef.current, {
            type: "scatter",
            data: {
                datasets: [
                    {
                        label: "Исходные точки",
                        data: xs.map((x, i) => ({ x, y: ys[i] })),
                        backgroundColor: "#000",
                        pointRadius: 5,
                        showLine: false,
                    },
                    {
                        label: `φ(x) — ${result.lab4ApproxName}`,
                        data: curvePts,
                        borderColor: "#0055cc",
                        backgroundColor: "transparent",
                        pointRadius: 0,
                        showLine: true,
                        borderWidth: 2,
                        tension: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: "top" },
                },
                scales: {
                    x: { title: { display: true, text: "x" } },
                    y: { title: { display: true, text: "y" } },
                },
            },
        })

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy()
                chartRef.current = null
            }
        }
    }, [result, xs, ys])

    if (!result || !result.lab4IsSuccess) return null
    return <canvas ref={canvasRef} className="approx-chart" />
}

function ApproxResult({ result, label, isBest }) {
    if (!result) return null
    const ok = result.lab4IsSuccess
    const xs = result._xs ?? []
    const ys = result._ys ?? []

    return (
        <div className={`approx-result-block${isBest ? " approx-result-block--best" : ""}`}>
            {label && (
                <div className="approx-result-label">
                    {label}{isBest ? " ★ НАИЛУЧШАЯ" : ""}
                </div>
            )}
            <div className={`approx-output ${ok ? "status-success" : "status-error"}`}>
                <div className="output-section-title">
                    {ok
                        ? `--- ${result.lab4ApproxName ?? "SUCCESS"} ---`
                        : "--- FAILED ---"}
                </div>

                {ok ? (
                    <>
                        <div className="stat-line">S (сумма кв. откл.) : <strong>{fmt(result.lab4DeviationS)}</strong></div>
                        <div className="stat-line">δ (ср. кв. откл.)   : <strong>{fmt(result.lab4StdDeviation)}</strong></div>
                        <div className="stat-line">R² (коэф. детерм.)  : <strong>{fmt(result.lab4Determination)}</strong></div>
                        {result.lab4Determination !== undefined && (
                            <div className="stat-line r2-msg">
                                ↳ <em>{r2Message(result.lab4Determination)}</em>
                            </div>
                        )}
                        {result.lab4PearsonR !== 0 && (
                            <div className="stat-line">r (Пирсон)          : <strong>{fmt(result.lab4PearsonR)}</strong></div>
                        )}
                        {result.lab4Coefficients && result.lab4Coefficients.length > 0 && (
                            <div className="stat-line">
                                коэффициенты        : <strong>[{result.lab4Coefficients.map(fmt).join(", ")}]</strong>
                            </div>
                        )}

                        {result.lab4PhiValues && result.lab4PhiValues.length > 0 && xs.length > 0 && (
                            <table className="approx-table">
                                <thead>
                                    <tr>
                                        <th>i</th>
                                        <th>xi</th>
                                        <th>yi</th>
                                        <th>φ(xi)</th>
                                        <th>εi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.lab4PhiValues.map((phi, i) => (
                                        <tr key={i}>
                                            <td>{i + 1}</td>
                                            <td>{fmt(xs[i])}</td>
                                            <td>{fmt(ys[i])}</td>
                                            <td>{fmt(phi)}</td>
                                            <td>{fmt(result.lab4Residuals?.[i])}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <ApproxChart result={result} xs={xs} ys={ys} />
                    </>
                ) : (
                    <p>{result.lab4ErrMessage || "Unknown error"}</p>
                )}
            </div>
        </div>
    )
}

function findBestIndex(results) {
    if (!results || results.length === 0) return -1
    let bestIdx = -1
    let bestS = Infinity
    results.forEach((r, i) => {
        if (r.lab4IsSuccess && r.lab4DeviationS < bestS) {
            bestS = r.lab4DeviationS
            bestIdx = i
        }
    })
    return bestIdx
}

function ApproxForm({ title, url, isAll }) {
    const [pointsText, setPointsText] = useState(DEFAULT_POINTS)
    const [validationError, setValidationError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState(null)
    const [fetchError, setFetchError] = useState(null)
    const [submittedPoints, setSubmittedPoints] = useState(null)

    const handleSubmit = async () => {
        const pts = parsePoints(pointsText)
        if (!pts) {
            setValidationError("Неверный формат точек. Каждая строка: x, y (числа)")
            return
        }
        if (pts.length < 8) {
            setValidationError(`Слишком мало точек: ${pts.length}. Требуется от 8 до 12.`)
            return
        }
        if (pts.length > 12) {
            setValidationError(`Слишком много точек: ${pts.length}. Требуется от 8 до 12.`)
            return
        }
        setValidationError(null)
        setLoading(true)
        setResults(null)
        setFetchError(null)
        setSubmittedPoints(pts)

        try {
            const resp = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lab4Points: pts }),
            })
            const json = await resp.json()
            if (isAll) {
                setResults(json.lab4AllPayload ?? [])
            } else {
                setResults(json.lab4Payload ?? null)
            }
        } catch (e) {
            setFetchError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const enrichResult = (r) => {
        if (!r || !submittedPoints) return r
        return {
            ...r,
            _xs: submittedPoints.map(p => p[0]),
            _ys: submittedPoints.map(p => p[1]),
        }
    }

    const bestIdx = isAll && Array.isArray(results) ? findBestIndex(results) : -1

    return (
        <div className="approx-wrapper">
            <div className="approx-section-title">--- {title} ---</div>
            <div className="approx-layout">
                <div className="approx-left">
                    <p>[POINTS] (x, y — одна точка на строку, 8–12 точек):</p>
                    <textarea
                        className="approx-textarea"
                        value={pointsText}
                        onChange={e => { setPointsText(e.target.value); setValidationError(null) }}
                        rows={12}
                        spellCheck={false}
                    />
                    <div className="approx-hint">Формат: &quot;x, y&quot; или &quot;x y&quot;</div>

                    {validationError && (
                        <div className="approx-validation-error">!! {validationError}</div>
                    )}

                    <button
                        className="retro-btn retro-btn--primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "[ CALCULATING... ]" : "[ RUN SOLVER ]"}
                    </button>
                </div>

                <div className="approx-right">
                    <p>[RESULTS]:</p>

                    {loading && (
                        <div className="approx-status">[ CALCULATING... ]</div>
                    )}

                    {fetchError && !loading && (
                        <div className="approx-output status-error">
                            <div className="output-section-title">!! SYSTEM_ERROR !!</div>
                            <p>{fetchError}</p>
                        </div>
                    )}

                    {!loading && !fetchError && results !== null && (
                        isAll
                            ? (results).map((r, i) => (
                                <ApproxResult
                                    key={i}
                                    result={enrichResult(r)}
                                    label={`[ ${r.lab4ApproxName?.toUpperCase() ?? i} ]`}
                                    isBest={i === bestIdx}
                                />
                            ))
                            : <ApproxResult result={enrichResult(results)} label={null} isBest={false} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default ApproxForm
