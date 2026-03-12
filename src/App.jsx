import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import MainPage from "./mainPage/MainPage"
import Lab1 from "./labs/lab1/Lab1"
import Lab2 from "./labs/lab2/Lab2"
import NotFoundPage from "./notFoundPage/NotFoundPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={ <MainPage/> } />
        <Route path="/lab1" element={ <Lab1/> } />
        <Route path="/lab2" element={ <Lab2/> } />
        <Route path="*" element={ <NotFoundPage/> } />
      </Routes>
    </Router>
  )
}

export default App
