import React, { useRef, useState, useEffect } from "react";

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

function hslToHex(h:number, s:number, l:number) {
  l /= 100;
  s /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
      m = l - c/2,
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
  
  useEffect(() => {
    // Try to parse input hex value
    // We'll just ignore if not valid hex
  }, [value]);
  
  useEffect(() => {
    const ctx = hStrip.current?.getContext("2d");
    if (!ctx) return;
    for (let i = 0; i < 150; i++) {
      ctx.fillStyle = `hsl(${(i/150)*360},100%,50%)`;
      ctx.fillRect(0, i, 30, 1);
    }
  }, [hue]);

  useEffect(() => {
    const ctx = sBox.current?.getContext("2d");
    if (!ctx) return;
    for(let y = 0; y < 150; y++) {
      for(let x = 0; x < 150; x++) {
        let s = x/150*100, l = 100 - (y/150*100);
        ctx.fillStyle = `hsl(${hue},${s}%,${l}%)`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [hue]);

  function handleHuePick(e: React.MouseEvent) {
    const rect = hStrip.current!.getBoundingClientRect();
    const y = e.nativeEvent.offsetY;
    const newHue = Math.round((y/150)*360);
    setHue(newHue);
    handleSatBoxPick({ nativeEvent: { offsetX: sat/100*150, offsetY: (100-light)/100*150 } } as any)
  }

  function handleSatBoxPick(e: React.MouseEvent) {
    const rect = sBox.current!.getBoundingClientRect();
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    let s = Math.max(0, Math.min(100, (x/150)*100));
    let l = 100 - Math.max(0, Math.min(100, (y/150)*100));
    setSat(s);
    setLight(l);
    const hex = hslToHex(hue, s, l);
    onChange(hex);
  }

  return (
    <div className="flex gap-2">
      <div style={{position: "relative"}}>
        <canvas
          ref={sBox}
          width={150}
          height={150}
          style={{borderRadius: 6, backgroundColor:"#fff", cursor:"crosshair"}}
          onClick={handleSatBoxPick}
        />
        <div
          style={{
            position: "absolute",
            left: `${(sat/100)*150-8}px`,
            top: `${(100-light)/100*150-8}px`,
            width: 16, 
            height: 16, 
            borderRadius: "50%",
            border: "2px solid #fff", 
            boxShadow: "0 0 3px 1px #0005",
            pointerEvents: "none"
          }}
        />
      </div>
      <div style={{position:"relative"}}>
        <canvas
          ref={hStrip}
          width={30}
          height={150}
          style={{borderRadius: 15, background: "linear-gradient(to bottom, red, yellow, lime, cyan, blue, magenta, red)", cursor:"crosshair"}}
          onClick={handleHuePick}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: `${(hue/360)*150-8}px`,
            width: 34, 
            height: 16, 
            borderRadius: 8,
            border: "2px solid #fff", 
            pointerEvents: "none"
          }}
        />
      </div>
    </div>
  );
};

export default ColorPicker;
