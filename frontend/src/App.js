import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* add more routes here */}
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
