// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ViewStream from './Pages/ViewStream'
import RecordStream from './Pages/RecordStream'
import Home from './Pages/Home' 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch" element={<ViewStream />} />
        <Route path="/broadcast" element={<RecordStream />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App