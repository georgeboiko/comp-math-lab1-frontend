import { Link } from "react-router-dom"
import "./MainPage.css"

const AVAILABLE_LABS = [
  { "title": "/lab1", "href": "/lab1" },
  { "title": "/lab2", "href": "/lab2" },
  { "title": "/lab3", "href": "/lab3" }
]

const GITHUB_LINK = "https://github.com/georgeboiko/comp-math-lab1-on-haskell"

function MainPage() {
    return (
        <div className="container">
            <h1 className="title"> Вычислительная математика </h1>
            <nav className="labs-list">
                <Link to="../" className="lab-button" style={{color: '#bc1010'}}>[DIR]  ..</Link>
                <a href={GITHUB_LINK} className="lab-button"> /github</a>
                {AVAILABLE_LABS.map(lab => (
                    <Link to={lab.href} key={lab.href} className="lab-button"> 
                        {lab.title} 
                    </Link>
                ))}
            </nav>
        </div>
    )
}

export default MainPage
