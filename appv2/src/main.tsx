import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./App.css";
import { DefaultStore } from "./state/store";

const store = DefaultStore;
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container!);
  if (root) {
    root.render(
      <BrowserRouter>
        <Provider store={store}>
          <App />
        </Provider>
      </BrowserRouter>
    );
  }
}
