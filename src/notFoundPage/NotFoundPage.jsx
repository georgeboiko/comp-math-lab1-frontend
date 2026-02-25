import { Link } from "react-router-dom"

function NotFoundPage() {
    return (
        <div className="container">
            <nav className="labs-list">
                <Link to="../" className="lab-button" style={{color: '#bc1010'}}>[DIR]  ..</Link>
                <div className="lab-button"> File not found. Error 404. </div>
            </nav>
        </div>
    )
}

export default NotFoundPage