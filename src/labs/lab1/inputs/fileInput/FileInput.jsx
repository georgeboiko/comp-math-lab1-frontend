import React, { useState } from 'react'
import { Link } from "react-router-dom"
import './FileInput.css'
import Output from '../../outputs/Output'

function FileInput() {
    const [fileName, setFileName] = useState("file isn't selected")
    const [preview, setPreview] = useState("")
    
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState("")

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        setFileName(file.name)
        setError("")
        setResult(null)

        const reader = new FileReader()
        reader.onload = (event) => setPreview(event.target.result)
        reader.readAsText(file)
    };

    const handleSubmit = async () => {
        setLoading(true)
        setError("")
        setResult(null)

        try {
            const lines = preview.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0)
            
            const n = parseInt(lines[0])
            if (isNaN(n) || n <= 0) throw new Error("Некорректная размерность n")

            if (lines.length < n + 3) throw new Error(`Ожидалось ${n + 3} строк, получено ${lines.length}`)

            const matrix = lines.slice(1, n + 1).map((line, rowIndex) => {
                const row = line.split(' ').map(val => Number(val.replace(',', '.')))
                if (row.length !== n) throw new Error(`Строка матрицы ${rowIndex + 1} должна содержать ${n} чисел`)
                if (row.some(isNaN)) throw new Error(`В строке матрицы ${rowIndex + 1} есть некорректные числа`)
                return row;
            })

            const vector = lines[n + 1].split(/\s+/).map(val => Number(val.replace(',', '.')))
            if (vector.length !== n) throw new Error(`Вектор B должен содержать ${n} чисел`)
            if (vector.some(isNaN)) throw new Error("В векторе B есть некорректные числа")

            const eps = Number(lines[n + 2].replace(',', '.'))

            const dataToSend = {
                lab1N: n,
                lab1Matrix: matrix,
                lab1Vector: vector,
                lab1Eps: eps
            }

            const response = await fetch('/api/lab/1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            })

            if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`)

            const data = await response.json()
            setResult(data.lab1Payload)

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="file-input-wrapper">
            <div className="file-upload-container">
                <input 
                    type="file" 
                    id="file-selector" 
                    className="hidden-input" 
                    accept=".txt"
                    onChange={handleFileChange}
                />
                <label htmlFor="file-selector" className="file-label">
                    [ SELECT_FILE ]
                </label>
                <div className="file-status">Status: {fileName}</div>
            </div>

            {error && <div style={{ color: 'red', marginTop: '10px' }}> ERROR: {error}</div>}

            {preview && (
                <div className="file-preview">
                    <div style={{ color: '#888', marginBottom: '5px' }}>--- ПРЕДПРОСМОТР ---</div>
                    {preview}
                </div>
            )}

            {preview && !error && (
                <Link 
                    className="lab-button" 
                    style={{ marginTop: '20px' }}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "[ CALCULATING... ]" : "[ IMPORT_AND_SOLVE ]"}
                </Link>
            )}

            <Output result={result} serverError={error} needUserData={false}/>
        </div>
    )
}

export default FileInput
