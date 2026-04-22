import { useState } from "react"
import { Link } from "react-router-dom"
import Linear from "./linear/Linear"
import Quadratic from "./quadratic/Quadratic"
import Cubic from "./cubic/Cubic"
import Exponential from "./exponential/Exponential"
import Logarithmic from "./logarithmic/Logarithmic"
import Power from "./power/Power"
import All from "./all/All"
import "./Lab4.css"

const METHODS = [
    { label: "/linear",      component: () => <Linear />      },
    { label: "/quadratic",   component: () => <Quadratic />   },
    { label: "/cubic",       component: () => <Cubic />       },
    { label: "/exponential", component: () => <Exponential /> },
    { label: "/logarithmic", component: () => <Logarithmic /> },
    { label: "/power",       component: () => <Power />       },
    { label: "/all",         component: () => <All />         },
]

function Lab4() {
    const [ActiveComponent, setActiveComponent] = useState(null)

    return (
        <div className="container">
            <h1 className="title"> Лабораторная работа №4 </h1>
            <div className="description"> Аппроксимация функций методом наименьших квадратов </div>
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

export default Lab4
