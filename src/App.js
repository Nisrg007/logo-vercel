import React, { useState } from 'react';
import Header from './components/Header';
import LogoGallery from './components/LogoGallery';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'gallery'

  const handleExploreClick = () => {
    setCurrentView('gallery');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  return (
    <div className="App">
      {currentView === 'home' ? (
        <Header onExploreClick={handleExploreClick} />
      ) : (
        <LogoGallery onBackToHome={handleBackToHome} />
      )}
    </div>
  );
}

export default App;