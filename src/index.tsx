import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import './styles/mui-overrides.css';

const rootElement = document.getElementById("root");

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <AuthProvider>
            <React.StrictMode>
                <App />
            </React.StrictMode>
        </AuthProvider>
    );
} else {
    console.error("❌ Root element not found! Make sure 'index.html' has <div id='root'></div>");
}
