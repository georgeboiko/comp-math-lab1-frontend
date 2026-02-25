import React, { useState } from 'react'
import { Link } from "react-router-dom"
import './GenerateInput.css'
import Output from '../../outputs/Output'

function GenerateInput() {
    const [size, setSize] = useState(3)
    const [eps, setEps] = useState("0.001")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [serverError, setServerError] = useState(null)


    const parseAndValidate = (val) => {
        if (val === "" || val === "-" || val === "." || val === "-.") return val
        const normalized = val.replace(',', '.')
        const num = Number(normalized)
        if (isNaN(num) || !isFinite(num)) {
            throw new Error("Некорректное число")
        }
        return normalized
    }

    const handleEpsChange = (val) => {
        try {
            const validated = parseAndValidate(val)
            setEps(validated)
        } catch (e) { console.warn(e.message) }
    }

    const handleSubmit = async () => {
        setLoading(true)
        setServerError(null)
        setResult(null)

        try {
            const dataToSend = {
                lab1GenN: size,
                lab1GenEps: parseFloat(eps)
            }

            const response = await fetch('/api/lab/1/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            })

            if (!response.ok) throw new Error('Ошибка сервера при расчете')

            const data = await response.json()
            setResult(data["lab1Payload"])
        } catch (err) {
            setServerError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="generate-container">
            <div className="gen-row">
                <label className="gui-label">[DIM_N]:</label>
                <select 
                    className="retro-select" 
                    value={size} 
                    onChange={(e) => setSize(Number(e.target.value))}
                    disabled={loading}
                >
                    {[...Array(20)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} x {i + 1}</option>
                    ))}
                </select>
            </div>

            <div className="gen-row">
                <label className="gui-label">[EPS]:</label>
                <input 
                    className="retro-input-line" 
                    type="text" 
                    value={eps} 
                    onChange={(e) => handleEpsChange(e.target.value)}
                    disabled={loading}
                />
            </div>

            <Link 
                className="lab-button" 
                style={{ opacity: loading ? 0.5 : 1 }}
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? "[ WAITING_RESPONSE... ]" : "[ RUN_SOLVER ]"}
            </Link>

            <Output result={result} serverError={serverError} needUserData={true}/>
        </div>
    )
}

export default GenerateInput
