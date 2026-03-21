import "@mantine/core/styles.css";
import "./index.css";

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route } from "react-router-dom";

import { App } from "./components/App/App";
import { Home } from "./components/Home/Home";
import { TopBar } from "./components/TopBar/TopBar";
import { Footer } from "./components/Footer/Footer";
import { serverPath } from "./utils/utils";
import { Create } from "./components/Create/Create";
import config from "./config";
import { DEFAULT_STATE, MetadataContext } from "./MetadataContext";
import { createTheme, MantineProvider } from "@mantine/core";

const theme = createTheme({
  primaryColor: "blue",
  fontFamily: "'Inter', sans-serif",
});

// Initialize theme on HTML element before React renders
const savedTheme = localStorage.getItem("7sync-theme") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
document.documentElement.setAttribute("data-theme", savedTheme);

function useThemeScheme() {
  const [scheme, setScheme] = React.useState<"light" | "dark">(
    () => (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light"
  );
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") as "light" | "dark";
      if (t) setScheme(t);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return scheme;
}

const ThemeAwareMantineProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useThemeScheme();
  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme}>
      {children}
    </MantineProvider>
  );
};

class SevenSync extends React.Component {
  public state = {
    ...DEFAULT_STATE,
    // No Firebase = subscriber features enabled by default
    isSubscriber: true,
  };

  render() {
    return (
      <ThemeAwareMantineProvider>
        <MetadataContext.Provider value={this.state}>
          <BrowserRouter>
            <Route
              path="/"
              exact
              render={() => {
                return (
                  <React.Fragment>
                    <TopBar hideNewRoom />
                    <Home />
                    <Footer />
                  </React.Fragment>
                );
              }}
            />
            <Route
              path="/create"
              exact
              render={() => {
                return <Create />;
              }}
            />
            <Route
              path="/watch/:roomId"
              exact
              render={(props) => {
                return <App urlRoomId={props.match.params.roomId} />;
              }}
            />
            <Route
              path="/r/:vanity"
              exact
              render={(props) => {
                return <App vanity={props.match.params.vanity} />;
              }}
            />
          </BrowserRouter>
        </MetadataContext.Provider>
      </ThemeAwareMantineProvider>
    );
  }
}

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<SevenSync />);
