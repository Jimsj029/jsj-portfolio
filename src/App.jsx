import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Home } from "./pages/Home"
import { NotFound } from "./pages/NotFound"
import { Admin } from "./pages/Admin"
import { AuthProvider } from "@/contexts/AuthContext"
import { AdminModeProvider } from "@/contexts/AdminModeContext"



function App() {
  return (
    <AuthProvider>
      <AdminModeProvider>
        <BrowserRouter>
          <Routes>
            <Route index element={<Home />} />
            <Route path="admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminModeProvider>
    </AuthProvider>
  )
}

export default App
