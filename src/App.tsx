import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import AudioControls from './components/AudioControls';
import BackgroundSlideshow from './components/BackgroundSlideshow';
import Footer from './components/Footer';
import { initAnalytics, trackPageView } from './utils/analytics';
import './index.css';

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  return null;
}

function App() {
  return (
    <Router>
      <AnalyticsTracker />
      <div className="App">
        <BackgroundSlideshow />
        <div className="starfield"></div>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <AudioControls />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
