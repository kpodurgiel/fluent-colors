import { useMemo } from "react";
import { Colors } from "../colors/types";
import { useSettingContext } from "../App";
import "./ColorList.scss";

type RowProps = {
  name: string;
  light: string;
  hc: string;
  dark: string;
  isRightSide: boolean;
  resettable: boolean;
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

const Headers = ({ isRightSide = false }: { isRightSide: boolean }) => {
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
  return isRightSide ? x.reverse() : x;
};

const Row = ({ name, light, hc, dark, isRightSide = false, resettable }: RowProps) => {
  const { light: dlight, dark: ddark, hc: dhc, setOrderKey } = useSettingContext();

  const setOrder = () => setOrderKey(resettable ? null : { name, light, hc, dark });
  const buttonLabel = resettable ? "x" : "•";

  const x = [
    <div key="name" className="color-row color-row__name color-area--name" title={name}>
      <button className="color-row-button" onClick={setOrder}>
        {buttonLabel}
      </button>{" "}
      {name}
    </div>,
    dlight && <Color key="light" name="light" color={light} />,
    ddark && <Color key="dark" name="dark" color={dark} />,
    dhc && <Color key="hc" name="hc" color={hc} />,
  ];
  return isRightSide ? x.reverse() : x;
};

export const ColorList = ({
  colors,
  isRightSide = false,
  resettable = false,
}: {
  colors: Colors;
  isRightSide?: boolean;
  resettable?: boolean;
}) => {
  const rows = Object.entries(colors).map(([name, colors]) => (
    <Row key={name} {...{ name, ...colors, isRightSide, resettable }} />
  ));

  const { light, dark, hc } = useSettingContext();
  const columnCount = useMemo<number>(() => 1 + +light + +dark + +hc, [light, dark, hc]);

  return (
    <div
      className={`color-list ${isRightSide ? "color-list--right" : "color-list--left"}`}
      style={{ "--columns": columnCount } as React.CSSProperties}
    >
      <Headers {...{ isRightSide }} />
      {rows}
    </div>
  );
};
