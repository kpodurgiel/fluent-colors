import { useMemo } from "react";
import { Colors } from "../colors/types";
import { useSettingContext } from "../App";
import "./ColorList.scss";

type RowProps = {
  name: string;
  light: string;
  hc: string;
  dark: string;
  invertedRow: boolean;
};

type ColorProps = {
  name: string;
  color: string;
};

const Color = ({ name, color }: ColorProps) => (
  <div className={`color-row color-row__color color-area--${name}`} style={{ backgroundColor: color }} title={color}>
    {color}
  </div>
);

const Headers = ({ invertedRow = false }: { invertedRow: boolean }) => {
  const { light: dlight, dark: ddark, hc: dhc } = useSettingContext();

  const x = [
    <div key="name" className="color-header color-area--name">
      Color name
    </div>,
    dlight && (
      <div key="light" className="color-header color-area--light">
        Light
      </div>
    ),
    ddark && (
      <div key="dark" className="color-header color-area--dark">
        Dark
      </div>
    ),
    dhc && (
      <div key="hc" className="color-header color-area--hc">
        HC
      </div>
    ),
  ];
  return invertedRow ? x.reverse() : x;
};

const Row = ({ name, light, hc, dark, invertedRow = false }: RowProps) => {
  const { light: dlight, dark: ddark, hc: dhc, setOrderKey } = useSettingContext();

  const setOrder = () => setOrderKey({ light, hc, dark });

  const x = [
    <div key="name" className="color-row color-row__name color-area--name" title={name}>
      <button onClick={setOrder}>•</button> {name}
    </div>,
    dlight && <Color key="light" name="light" color={light} />,
    ddark && <Color key="dark" name="dark" color={dark} />,
    dhc && <Color key="hc" name="hc" color={hc} />,
  ];
  return invertedRow ? x.reverse() : x;
};

export const ColorList = ({ colors, invertedRow = false }: { colors: Colors; invertedRow: boolean }) => {
  const rows = Object.entries(colors).map(([name, colors]) => <Row key={name} {...{ name, ...colors, invertedRow }} />);

  const { light, dark, hc } = useSettingContext();
  const columnCount = useMemo<number>(() => 1 + +light + +dark + +hc, [light, dark, hc]);

  const styles = { "--columns": columnCount } as React.CSSProperties;

  return (
    <div className={`color-list ${invertedRow ? "" : "color-list--old-fluent"}`} style={styles}>
      <Headers {...{ invertedRow }} />
      {rows}
    </div>
  );
};
