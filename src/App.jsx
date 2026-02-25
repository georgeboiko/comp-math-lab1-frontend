import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import MainPage from "./mainPage/MainPage"
import Lab1 from "./labs/lab1/Lab1"
import NotFoundPage from "./notFoundPage/NotFoundPage"

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={ <MainPage/> } />
        <Route path="/lab1" element={<Lab1 />} />
        <Route path="*" element={<NotFoundPage/>} />
      </Routes>
    </Router>
  )
}

export default App
