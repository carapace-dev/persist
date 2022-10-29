import React from "react";
import { ThemeSwitcherProvider } from "react-css-theme-switcher";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Web3ContextProvider } from "./context/web3Details";
import { ScreenSizeProvider } from "./context/screenSize";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container);

const themes = {
  dark: `${process.env.PUBLIC_URL}/dark-theme.css`,
  light: `${process.env.PUBLIC_URL}/light-theme.css`,
};

const prevTheme = window.localStorage.getItem("theme");

root.render(
  <ThemeSwitcherProvider themeMap={themes} defaultTheme={prevTheme || "dark"}>
    <BrowserRouter>
      <Web3ContextProvider>
        <ScreenSizeProvider>
          <App />
        </ScreenSizeProvider>
      </Web3ContextProvider>
    </BrowserRouter>
  </ThemeSwitcherProvider>,
);
