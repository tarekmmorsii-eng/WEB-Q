import './src/devErrorOverlay';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import './index.css?v=2026-01-02-v2';
import App from './App';
import './components/modalDesign.css';
import './utils/iosViewport.css';

if (Capacitor.getPlatform() === 'ios') {
  const root = document.documentElement;
  root.dataset.nativePlatform = 'ios';
  const viewport = window.visualViewport;
  if (viewport) {
    // The keyboard changes the visual viewport while fixed dialogs still use the layout viewport.
    const updateViewport = () => {
      root.style.setProperty('--ios-viewport-height', `${viewport.height}px`);
      root.style.setProperty('--ios-viewport-top', `${viewport.offsetTop}px`);
    };
    updateViewport();
    viewport.addEventListener('resize', updateViewport);
    viewport.addEventListener('scroll', updateViewport);
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
