// app.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Router, Routes, Route
import ModelPage from './Pages/Modelpage';
import Mainpage from './Pages/Mainpage';
import DeveloperResorce from './Pages/developerResource'

function App() {
  return (
    <Router>  {/* Wrap everything in Router */}
      <Routes>  {/* Use Routes to define routes */}
        <Route path="/" element={<Mainpage />} /> {/* Define the root path to Mainpage */}
        <Route path="/modelpage" element={<ModelPage />} /> {/* Define the /modelpage path to ModelPage */}
        <Route path="/developerResource" element={<DeveloperResorce />} /> {/* Define the /modelpage path to ModelPage */}

      </Routes>
    </Router>
  );
}

export default App;