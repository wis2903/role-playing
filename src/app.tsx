import React from 'react';
import { useClearBrowserCache } from 'react-clear-browser-cache';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// styles
import styles from './app.module.scss';

// pages
import Home from './pages/home';

// main
const Pages = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
};

const App = (): JSX.Element => {
  useClearBrowserCache();

  return (
    <div className={styles.app}>
      <Router>
        <Pages />
      </Router>
    </div>
  );
};

export default App;
