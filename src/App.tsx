import { ReactNode, createContext, useContext, useMemo, useState } from "react";
import "./App.scss";
import { ColorList } from "./ColorList";
import { fluentOld } from "./colors/fluentOld";
import { fluentNew } from "./colors/fluentNew";
import Color from "colorjs.io";
import { useDebouncedCallback } from "use-debounce";

type OrderKeyType = {
  name: string;
  light: string;
  dark: string;
  hc: string;
} | null;

interface SettingsContextType {
  light: boolean;
  setLight: (x: React.SetStateAction<boolean>) => void;
  dark: boolean;
  setDark: (x: React.SetStateAction<boolean>) => void;
  hc: boolean;
  setHc: (x: React.SetStateAction<boolean>) => void;
  orderKey: OrderKeyType;
  setOrderKey: (x: React.SetStateAction<OrderKeyType>) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const SettingsContextProvider = ({ children }: { children: ReactNode | ReactNode[] }) => {
  const [light, setLight] = useState<boolean>(true);
  const [dark, setDark] = useState<boolean>(true);
  const [hc, setHc] = useState<boolean>(true);
  const [orderKey, setOrderKey] = useState<OrderKeyType>(null);

  return (
    <SettingsContext.Provider
      value={{
        light,
        setLight,
        dark,
        setDark,
        hc,
        setHc,
        orderKey,
        setOrderKey,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingContext = () => {
  const ctx = useContext(SettingsContext);
  return ctx as SettingsContextType;
};

const calculateColorDifferences = (keyLight: Color, keyDark: Color, light: string, dark: string) => {
  return (keyLight.deltaE2000(new Color(light)) + keyDark.deltaE2000(new Color(dark))) / 2;
};

const AppSettings = () => {
  const { light, setLight, dark, setDark, hc, setHc, setOrderKey } = useSettingContext();
  const [isInvalidInput, setIsInvalidInput] = useState<boolean>(false);

  const handleInput = useDebouncedCallback((e) => {
    const value = e.target?.value;
    if (!value) {
      setOrderKey(null);
      setIsInvalidInput(false);
    }
    let color;
    try {
      color = new Color(value);
    } catch {
      if (value) {
        setIsInvalidInput(true);
      }
     }
    if (value && color) {
      setIsInvalidInput(false);
      setOrderKey({
        name: "Searched value",
        light: value,
        dark: value,
        hc: value,
      });
    }
  }, 500);

  return (
  <div className="app__settings">
    <label>
      <input type="checkbox" checked={light} onChange={() => setLight((v: boolean) => !v)} /> light
    </label>
    <label>
      <input type="checkbox" checked={dark} onChange={() => setDark((v: boolean) => !v)} /> dark
    </label>
    <label>
      <input type="checkbox" checked={hc} onChange={() => setHc((v: boolean) => !v)} /> hc
    </label>
    <div className={`app__settings__search ${isInvalidInput ? "app__settings__search--error" : ""}`}>
      <input type="text" placeholder="Type in a color..." onChange={handleInput} onFocus={handleInput} />
      <div>{isInvalidInput ? "Cannot parse this as color" : "\u00a0"}</div>
    </div>
  </div>
  );
}

const AppInner = () => {
  const { orderKey } = useSettingContext();

  const fluentNewSorted = useMemo(() => {
    if (!orderKey) return fluentNew;
    const keyLight = new Color(orderKey.light);
    const keyDark = new Color(orderKey.dark);
    const colorsWithDiffs = Object.entries(fluentNew)
      .map((color) => ({
        color,
        difference: calculateColorDifferences(keyLight, keyDark, color[1].light, color[1].dark),
      }))
      .sort((a, b) => a.difference - b.difference)
      .map((x) => x.color);
    return Object.fromEntries(colorsWithDiffs);
  }, [fluentNew, orderKey]);

  return (
    <div className="app">
      <div className={`app__columns ${orderKey ? "app__columns--stretch" : ""}`}>
        <AppSettings />

        <h1 className="app__old-header">Old Fluent</h1>
        <h1 className="app__new-header">New Fluent</h1>

        {orderKey ? (
          <>
            <ColorList colors={{ x: orderKey }} resettable />
            <ColorList colors={fluentNewSorted} isRightSide />
          </>
        ) : (
          <>
            <ColorList colors={fluentOld} />
            <ColorList colors={fluentNew} isRightSide />
          </>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SettingsContextProvider>
      <AppInner />
    </SettingsContextProvider>
  );
}
