import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // 确保路径指向当前目录下的 App.jsx
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
