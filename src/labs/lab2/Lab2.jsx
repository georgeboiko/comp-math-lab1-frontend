import { useState } from "react"
import { Link } from "react-router-dom"
import Chord from "./chord/Chord"
import Newton from "./newton/Newton"
import Iters from "./iters/Iters"
import System from "./system/System"
import "./Lab2.css"

const METHODS = [
    { label: "/chord",  component: () => <Chord/>  },
    { label: "/newton", component: () => <Newton/> },
    { label: "/iters",  component: () => <Iters/>  },
    { label: "/system", component: () => <System/> },
]

function Lab2() {
    const [ActiveComponent, setActiveComponent] = useState(null)

    return (
        <div className="container">
            <h1 className="title"> Лабораторная работа №2 </h1>
            <div className="description"> Нелинейные уравнения и системы </div>
            <nav className="labs-list">
                <Link to="../" className="lab-button" style={{color: '#bc1010'}}>[DIR]  ..</Link>
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

export default Lab2
