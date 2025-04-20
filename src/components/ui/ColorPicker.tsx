
import React, { useRef, useState, useEffect } from "react";

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  s /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2,
    r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const sBox = useRef<HTMLCanvasElement>(null);
  const hStrip = useRef<HTMLCanvasElement>(null);
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(100);
  const [light, setLight] = useState(50);
  const [isHueMouseDown, setIsHueMouseDown] = useState(false);
  const [isSatBoxMouseDown, setIsSatBoxMouseDown] = useState(false);

  // Helper to parse hex to hsl (so that external value changes update the picker UI when coming from props)
  function hexToHsl(hex: string): [number, number, number] {
    let c = hex.replace(/^#/, "");
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
        case g: h = ((b - r) / d + 2); break;
        case b: h = ((r - g) / d + 4); break;
      }
      h = Math.round(h * 60);
      s = Math.round(s * 100);
      l = Math.round(l * 100);
    } else {
      h = 0; s = 0; l = Math.round(l * 100);
    }
    return [h, s, l];
  }

  // Sync UI and 'internal' color states to external hex value
  useEffect(() => {
    if (value) {
      try {
        const [h, s, l] = hexToHsl(value);
        setHue(h);
        setSat(s);
        setLight(l);
      } catch { }
    }
    // eslint-disable-next-line
  }, [value]);

  useEffect(() => {
    const ctx = hStrip.current?.getContext("2d");
    if (!ctx) return;
    for (let i = 0; i < 150; i++) {
      ctx.fillStyle = `hsl(${(i / 150) * 360},100%,50%)`;
      ctx.fillRect(0, i, 30, 1);
    }
  }, []);

  useEffect(() => {
    const ctx = sBox.current?.getContext("2d");
    if (!ctx) return;
    for (let y = 0; y < 150; y++) {
      for (let x = 0; x < 150; x++) {
        let s = x / 150 * 100, l = 100 - (y / 150 * 100);
        ctx.fillStyle = `hsl(${hue},${s}%,${l}%)`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [hue]);

  // Handles both React synthetic and DOM MouseEvent
  function getOffset(e: React.MouseEvent | MouseEvent, element: HTMLCanvasElement) {
    if ("nativeEvent" in e && (e as React.MouseEvent).nativeEvent) {
      // React synthetic event
      return {
        offsetX: (e as React.MouseEvent).nativeEvent.offsetX,
        offsetY: (e as React.MouseEvent).nativeEvent.offsetY,
      };
    } else {
      // DOM mouse event
      const rect = element.getBoundingClientRect();
      return {
        offsetX: (e as MouseEvent).clientX - rect.left,
        offsetY: (e as MouseEvent).clientY - rect.top
      };
    }
  }

  function handleHuePick(e: React.MouseEvent | MouseEvent) {
    if (!hStrip.current) return;
    const { offsetY } = getOffset(e, hStrip.current);
    const newHue = Math.max(0, Math.min(360, Math.round((offsetY / 150) * 360)));
    setHue(newHue);
    updateColorFromHSL(newHue, sat, light);
  }

  function handleSatBoxPick(e: React.MouseEvent | MouseEvent) {
    if (!sBox.current) return;
    const { offsetX, offsetY } = getOffset(e, sBox.current);
    let s = Math.max(0, Math.min(100, (offsetX / 150) * 100));
    let l = 100 - Math.max(0, Math.min(100, (offsetY / 150) * 100));
    setSat(s);
    setLight(l);
    updateColorFromHSL(hue, s, l);
  }

  function updateColorFromHSL(h: number, s: number, l: number) {
    const hex = hslToHex(h, s, l);
    onChange(hex);
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (isHueMouseDown) handleHuePick(e);
      else if (isSatBoxMouseDown) handleSatBoxPick(e);
    }
    function handleMouseUp() {
      setIsHueMouseDown(false);
      setIsSatBoxMouseDown(false);
    }
    if (isHueMouseDown || isSatBoxMouseDown) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isHueMouseDown, isSatBoxMouseDown, hue, sat, light]);

  // For accessibility, allow focus + keyboard
  // For pointer feedback, dot follows pointer during drag, cursor crosshair

  return (
    <div className="flex gap-2">
      <div style={{ position: "relative" }}>
        <canvas
          ref={sBox}
          width={150}
          height={150}
          style={{ borderRadius: 6, backgroundColor: "#fff", cursor: "crosshair" }}
          onMouseDown={(e) => {
            setIsSatBoxMouseDown(true);
            handleSatBoxPick(e);
          }}
        />
        <div
          style={{
            position: "absolute",
            left: `${(sat / 100) * 150 - 8}px`,
            top: `${(100 - light) / 100 * 150 - 8}px`,
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: "2px solid #fff",
            boxShadow: "0 0 3px 1px #0005",
            pointerEvents: "none",
            background: value,
            transition: isSatBoxMouseDown ? "none" : "box-shadow 0.2s, border 0.2s"
          }}
        />
      </div>
      <div style={{ position: "relative" }}>
        <canvas
          ref={hStrip}
          width={30}
          height={150}
          style={{
            borderRadius: 15,
            background: "linear-gradient(to bottom, red, yellow, lime, cyan, blue, magenta, red)",
            cursor: "crosshair"
          }}
          onMouseDown={e => {
            setIsHueMouseDown(true);
            handleHuePick(e);
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: `${(hue / 360) * 150 - 8}px`,
            width: 34,
            height: 16,
            borderRadius: 8,
            border: "2px solid #fff",
            pointerEvents: "none",
            background: `hsl(${hue},100%,50%)`,
            boxShadow: "0 0 3px 1px #0005",
            transition: isHueMouseDown ? "none" : "box-shadow 0.2s, border 0.2s"
          }}
        />
      </div>
    </div>
  );
};

export default ColorPicker;
