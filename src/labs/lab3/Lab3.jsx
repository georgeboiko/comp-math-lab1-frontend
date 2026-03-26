import { useState } from "react"
import { Link } from "react-router-dom"
import Rectangles from "./rectangles/Rectangles"
import Trapeze from "./trapeze/Trapeze"
import Simpson from "./simpson/Simpson"
import "./Lab3.css"

const METHODS = [
    { label: "/rectangles", component: () => <Rectangles /> },
    { label: "/trapeze",    component: () => <Trapeze />    },
    { label: "/simpson",    component: () => <Simpson />    },
]

function Lab3() {
    const [ActiveComponent, setActiveComponent] = useState(null)

    return (
        <div className="container">
            <h1 className="title"> Лабораторная работа №3 </h1>
            <div className="description"> Численное интегрирование </div>
            <nav className="labs-list">
                <Link to="../" className="lab-button" style={{ color: '#bc1010' }}>[DIR]  ..</Link>
                {METHODS.map(method => (
                    <Link
                        className="lab-button"
                        key={method.label}
                        onClick={() => setActiveComponent(() => method.component)}
                    >
                        {method.label}
                    </Link>
                ))}
            </nav>
            {ActiveComponent && <ActiveComponent />}
        </div>
    )
}

export default Lab3