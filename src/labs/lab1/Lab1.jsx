import { useState } from "react"
import { Link } from "react-router-dom"
import GuiInput from "./inputs/guiInput/GuiInput"
import FileInput from "./inputs/fileInput/FileInput"
import GenerateInput from "./inputs/generateInput/GenerateInput"
import "./Lab1.css"

function Lab1() {

    const [component, setComponent] = useState(<GuiInput/>)

    const BUTTONS = [
        {"label": "/manual", "component": <GuiInput/>},
        {"label": "/file", "component": <FileInput/>},
        {"label": "/generate", "component": <GenerateInput/>}
    ]

    return (
        <div className="container">
            <h1 className="title"> Лабораторная работа №1 </h1>
            <div className="description"> Решение СЛАУ методом простых итераций </div>
            <div className="labs-list">
                <Link to="../" className="lab-button" style={{color: '#bc1010'}}>[DIR]  ..</Link>
                {BUTTONS.map(button => (
                    <Link className="lab-button" key={button.label} onClick={() => setComponent(button.component)}>
                        {button.label}
                    </Link>
                ))}
            </div>
            {component}
        </div>
    )
}

export default Lab1
