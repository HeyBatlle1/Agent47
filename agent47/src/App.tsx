import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Studio from './pages/Studio'
import Settings from './pages/Settings'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/settings" element={<Settings />} />
          {/* Legacy chat route redirects to studio */}
          <Route path="/chat" element={<Studio />} />
          <Route path="/chat/:conversationId" element={<Studio />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App