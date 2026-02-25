import React, { useState } from 'react'
import { Link } from "react-router-dom"
import Output from '../../outputs/Output'
import './GuiInput.css'

function GuiInput() {
    const [size, setSize] = useState(3)
    const [eps, setEps] = useState("0.001")
    const [matrix, setMatrix] = useState(Array(20).fill(0).map(() => Array(20).fill("")))
    const [vector, setVector] = useState(Array(20).fill(""))

    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
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

    const handleMatrixChange = (r, c, val) => {
        try {
            const validated = parseAndValidate(val)
            const newMatrix = [...matrix]
            newMatrix[r][c] = validated
            setMatrix(newMatrix)
        } catch (e) { console.warn(e.message) }
    }

    const handleVectorChange = (i, val) => {
        try {
            const validated = parseAndValidate(val)
            const newVector = [...vector]
            newVector[i] = validated
            setVector(newVector)
        } catch (e) { console.warn(e.message) }
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
                lab1N: size,
                lab1Matrix: matrix.slice(0, size).map(row =>
                    row.slice(0, size).map(val => parseFloat(val || 0))
                ),
                lab1Vector: vector.slice(0, size).map(val => parseFloat(val || 0)),
                lab1Eps: parseFloat(eps)
            }

            const response = await fetch('/api/lab/1', {
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
        <div className="gui-wrapper">
            <div className="gui-controls">
                <div>
                    <label className="gui-label">[DIM_N]: </label>
                    <select
                        className="retro-select"
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                    >
                        {[...Array(20)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1} x {i + 1}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="gui-label">[EPS]: </label>
                    <input
                        className="retro-input-line"
                        type="text"
                        value={eps}
                        onChange={(e) => handleEpsChange(e.target.value)}
                    />
                </div>
            </div>

            <div className="matrix-container">
                <table className="matrix-table">
                    <thead>
                        <tr>
                            <th className="matrix-header">MATRIX_A</th>
                            <th style={{ width: '40px' }}></th>
                            <th className="matrix-header">VECTOR_B</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(size)].map((_, i) => (
                            <tr key={i}>
                                <td>
                                    {[...Array(size)].map((_, j) => (
                                        <input
                                            key={j}
                                            className="matrix-cell"
                                            value={matrix[i][j]}
                                            onChange={(e) => handleMatrixChange(i, j, e.target.value)}
                                            placeholder="0"
                                        />
                                    ))}
                                </td>
                                <td className="divider-cell">|</td>
                                <td>
                                    <input
                                        className="matrix-cell vector-cell"
                                        value={vector[i]}
                                        onChange={(e) => handleVectorChange(i, e.target.value)}
                                        placeholder="0"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Link
                className="lab-button"
                onClick={handleSubmit}
                disabled={loading}
                style={{ marginTop: '20px' }}
            >
                {loading ? "[ CALCULATING... ]" : "[ RUN_SOLVER ]"}
            </Link>

            <Output result={result} serverError={serverError} needUserData={false}/>
        </div>
    )
}

export default GuiInput
