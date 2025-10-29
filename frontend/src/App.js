import React from 'react';
import './App.css';
import SocialFlow from './SocialFlow';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <div className="App">
      <SocialFlow />
      <Toaster />
    </div>
  );
}

export default App;