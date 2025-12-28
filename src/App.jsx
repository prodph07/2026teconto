import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreateCapsule from './pages/CreateCapsule';
import ViewCapsule from './pages/ViewCapsule'; // <--- IMPORTANTE: Importe o arquivo

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/criar" element={<CreateCapsule />} />
        
        {/* NOVA ROTA DINÂMICA */}
        <Route path="/v/:id" element={<ViewCapsule />} />
      </Routes>
    </BrowserRouter>
  );
}