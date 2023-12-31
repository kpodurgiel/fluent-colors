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
  calcLight: boolean;
  setCalcLight: (x: React.SetStateAction<boolean>) => void;
  calcDark: boolean;
  setCalcDark: (x: React.SetStateAction<boolean>) => void;
  calcHC: boolean;
  setCalcHC: (x: React.SetStateAction<boolean>) => void;
  orderKey: OrderKeyType;
  setOrderKey: (x: React.SetStateAction<OrderKeyType>) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const SettingsContextProvider = ({ children }: { children: ReactNode | ReactNode[] }) => {
  const [light, setLight] = useState<boolean>(true);
  const [dark, setDark] = useState<boolean>(true);
  const [hc, setHc] = useState<boolean>(true);
  const [calcLight, setCalcLight] = useState<boolean>(true);
  const [calcDark, setCalcDark] = useState<boolean>(true);
  const [calcHC, setCalcHC] = useState<boolean>(false);
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
        calcLight,
        setCalcLight,
        calcDark,
        setCalcDark,
        calcHC,
        setCalcHC,
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

const AppSettings = () => {
  const {
    light,
    setLight,
    dark,
    setDark,
    hc,
    setHc,
    calcLight,
    setCalcLight,
    calcDark,
    setCalcDark,
    calcHC,
    setCalcHC,
    setOrderKey,
  } = useSettingContext();
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
  }, 400);

  return (
    <div className="app__settings">
      <fieldset className="app__settings__checkboxes">
        <legend>Visibility</legend>
        <label>
          <input type="checkbox" checked={light} onChange={() => setLight((v: boolean) => !v)} /> Light
        </label>
        <label>
          <input type="checkbox" checked={dark} onChange={() => setDark((v: boolean) => !v)} /> Dark
        </label>
        <label>
          <input type="checkbox" checked={hc} onChange={() => setHc((v: boolean) => !v)} /> HC
        </label>
      </fieldset>
      <fieldset className="app__settings__checkboxes">
        <legend>Calc using</legend>
        <label>
          <input type="checkbox" checked={calcLight} onChange={() => setCalcLight((v: boolean) => !v)} /> Light
        </label>
        <label>
          <input type="checkbox" checked={calcDark} onChange={() => setCalcDark((v: boolean) => !v)} /> Dark
        </label>
        <label>
          <input type="checkbox" checked={calcHC} onChange={() => setCalcHC((v: boolean) => !v)} /> HC
        </label>
      </fieldset>
      <fieldset className={`app__settings__search ${isInvalidInput ? "app__settings__search--error" : ""}`}>
        <legend>{isInvalidInput ? "Cannot parse this as color" : "Match against a color"}</legend>
        <input type="text" placeholder="Type in a color..." onChange={handleInput} onFocus={handleInput} />
      </fieldset>
    </div>
  );
};

const AppInner = () => {
  const { calcLight, calcDark, calcHC, orderKey } = useSettingContext();

  const fluentNewSorted = useMemo(() => {
    if (!orderKey) return fluentNew;

    const keyLight = new Color(orderKey.light);
    const keyDark = new Color(orderKey.dark);
    const keyHC = new Color(orderKey.hc);

    const colorsWithDiffs = Object.entries(fluentNew)
      .map((color) => {
        const listOfPairs = [];
        if (calcLight) listOfPairs.push([keyLight, new Color(color[1].light)]);
        if (calcDark) listOfPairs.push([keyDark, new Color(color[1].dark)]);
        if (calcHC) listOfPairs.push([keyHC, new Color(color[1].hc)]);

        return {
          color,
          difference: calculateColorDifferences(listOfPairs),
        };
      })
      .sort((a, b) => a.difference - b.difference)
      .map((x) => x.color);
    return Object.fromEntries(colorsWithDiffs);
  }, [fluentNew, orderKey, calcLight, calcDark, calcHC]);

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

const calculateColorDifferences = (listOfPairs: Color[][]) => {
  return listOfPairs.map(([a, b]) => a.deltaE2000(b)).reduce((a, b) => a + b, 0) / listOfPairs.length;
};

export default function App() {
  return (
    <SettingsContextProvider>
      <AppInner />
    </SettingsContextProvider>
  );
}
