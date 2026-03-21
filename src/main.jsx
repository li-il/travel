import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // 重点检查这一行！确保路径和文件名大小写完全匹配
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
 