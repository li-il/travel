import React from 'react'
import ReactDOM from 'react-dom/client'
// 确保这里的小点和斜杠正确，且 App 的首字母大写
import App from './App' 
import './index.css'

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  console.error("Failed to find the root element");
}
