import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import LocalStorageProvider from "./contexts/LocalStorageContext";
import { QueryClient, QueryClientProvider } from "react-query";
import AppContextProvider from './contexts/AppContext';

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LocalStorageProvider>
        <AppContextProvider>
          <RouterProvider router={router} />
        </AppContextProvider>
      </LocalStorageProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
