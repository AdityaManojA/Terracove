import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './taskflow.css';
import './dark.css';
import './actions.css';
import './responsive.css';
import './scrollbars.css';
import './calendar-refresh.css';
import './theme.css';
import './calendar.css';
// Keep phone gestures at the app's scale; restore normal browser zoom on desktop.
function MobileViewport() {
  React.useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]'), original = viewport?.content;
    const mobile = matchMedia('(max-width: 1023px)');
    const update = () => { if (viewport) viewport.content = mobile.matches ? original + ', maximum-scale=1, user-scalable=no' : original; };
    const preventPinch = e => { if (mobile.matches && (e.type.startsWith('gesture') || e.touches?.length > 1)) e.preventDefault(); };
    update(); mobile.addEventListener('change', update);
    document.addEventListener('touchmove', preventPinch, { passive: false });
    document.addEventListener('gesturestart', preventPinch, { passive: false });
    document.addEventListener('gesturechange', preventPinch, { passive: false });
    return () => {
      if (viewport) viewport.content = original;
      mobile.removeEventListener('change', update);
      document.removeEventListener('touchmove', preventPinch);
      document.removeEventListener('gesturestart', preventPinch);
      document.removeEventListener('gesturechange', preventPinch);
    };
  }, []);
  return null;
}
createRoot(document.getElementById('root')).render(<><MobileViewport /><App /></>);
if(import.meta.env.PROD&&'serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});});}
