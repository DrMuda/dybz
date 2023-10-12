import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import LocalStorageProvider from './contexts/LocalStorageContext';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LocalStorageProvider>
      <RouterProvider router={router} />
    </LocalStorageProvider>
  </React.StrictMode>
);
