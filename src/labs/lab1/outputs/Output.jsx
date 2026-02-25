import './Output.css'

function Output({ serverError, result, needUserData }) {
    if (!serverError && !result) return null

    return (
        <div className="output-wrapper">
            
            {serverError && (
                <div className="output-section status-error">
                    <div className="section-title">!! SYSTEM_ERROR !!</div>
                    <p> {serverError}</p>
                </div>
            )}

            {result && needUserData && (
                <div className="output-section">
                    <div className="section-title">--- GENERATED_DATA ---</div>
                    
                    <p>[MATRIX_A]:</p>
                    <div className="matrix-grid">
                        {result.lab1ClientMatrix.map((row, rIdx) => (
                            <div key={rIdx} className="matrix-row">
                                {row.map((val, cIdx) => (
                                    <div key={cIdx} className="matrix-val">
                                        {val.toFixed(6)}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <p>[VECTOR_B]:</p>
                    <div className="vector-list">
                        {result.lab1ClientVector.map((val, idx) => (
                            <div key={idx} className="vector-item">
                                b{idx + 1}: {val.toFixed(6)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {result && result.lab1IsSuccess && (
                <div className="output-section status-success">
                    <div className="section-title">--- CALCULATION_SUCCESS ---</div>
                    
                    <div className="vector-group">
                        <p> SOLUTION_VECTOR (X):</p>
                        <div className="vector-list">
                            {result.lab1AnsVector.map((val, idx) => (
                                <div key={idx} className="vector-item" style={{borderColor: 'green'}}>
                                    x{idx + 1}: {val.toFixed(6)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="vector-group">
                        <p> ERROR_VECTOR (Err):</p>
                        <div className="vector-list">
                            {result.lab1ErrVector.map((val, idx) => (
                                <div key={idx} className="vector-item">
                                    err{idx + 1}: {val.toExponential(4)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="stats-footer">
                        <div className="stat-line">TOTAL_ITERS : <strong>{result.lab1Iters}</strong></div>
                        <div className="stat-line">NORM   : <strong>{result.lab1Norm.toFixed(10)}</strong></div>
                    </div>
                </div>
            )}

            {result && !result.lab1IsSuccess && (
                <div className="output-section status-error">
                    <div className="section-title">--- CALCULATION_FAILED ---</div>
                    <p> Причина: Диагональное преобладание не достигнуто.</p>
                    <p>Метод простых итераций не гарантирует сходимость для данной системы.</p>
                </div>
            )}
        </div>
    )
}

export default Output
