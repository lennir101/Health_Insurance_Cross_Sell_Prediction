import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {ThemeProvider} from './components/theme-provider'
import {APP_CONFIG} from './config/appConfig'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider defaultTheme={APP_CONFIG.DEFAULT_THEME as 'light' | 'dark' | 'system'}>
            <App/>
        </ThemeProvider>
    </React.StrictMode>,
) 