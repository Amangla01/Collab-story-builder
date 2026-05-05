import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Login from "./pages/login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import StoryRoom from "./pages/StoryRoom"
import Archive from "./pages/Archive"


function App() {

  const {user} = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to = {user ? "/dashboard" : "/login"} />}/>
      <Route path="/login" element={<Login />}/>
      <Route path="/register" element={<Register />} /> 
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      <Route path="/story/:roomCode" element={<StoryRoom />} />
      <Route path="/archive" element={<Archive />} />
    </Routes>
  )
}

export default App
