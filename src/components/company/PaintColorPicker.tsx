
import React, { useState, useRef, useEffect } from "react";

const PAINT_COLORS = [
  // Rows of more vivid colors (like MS Paint but more vibrant)
  ["#ffffff", "#d4d4d8", "#a1a1aa", "#000000", "#ef4444", "#b91c1c", "#fde68a", "#ca8a04", "#22c55e", "#166534", "#2dd4bf", "#0f766e", "#3b82f6", "#1e40af", "#db2777", "#831843"],
  ["#f9a8d4", "#fbcfe8", "#fde68a", "#86efac", "#5eead4", "#38bdf8", "#60a5fa", "#818cf8", "#e879f9", "#e0e7ff", "#a78bfa", "#c4b5fd", "#f472b6", "#f43f5e", "#f97316", "#ea580c"],
  ["#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7", "#2563eb", "#4f46e5", "#8b5cf6", "#a78bfa", "#c084fc", "#ddbdfc", "#ec4899", "#db2777", "#f43f5e", "#be123c"],
];

function hexToRgb(hex: string) {
  let c = hex.replace("#", "");
  if (c.length === 3) { c = c[0]+c[0]+c[1]+c[1]+c[2]+c[2]; }
  const num = parseInt(c, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

interface PaintColorPickerProps {
  value: string;
  onChange: (val: string) => void;
}

export default function PaintColorPicker({ value, onChange }: PaintColorPickerProps) {
  const [hexInput, setHexInput] = useState(value || "#3b82f6");
  const [showSpectrum, setShowSpectrum] = useState(false);

  useEffect(() => {
    setHexInput(value);
  }, [value]);

  // Simple validation for HEX
  const validHex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  // --- Color spectrum logic ---
  const spectrumRef = useRef<HTMLCanvasElement>(null);
  const [spectrumPos, setSpectrumPos] = useState<{ x: number; y: number }>({ x: 120, y: 10 }); // somewhere near blue, not corner
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    drawSpectrum();
  }, []);

  function drawSpectrum() {
    const canvas = spectrumRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create a gradient (Hue left-right)
    const w = canvas.width, h = canvas.height;
    const gradH = ctx.createLinearGradient(0, 0, w, 0);
    for (let i = 0; i <= 360; i += 60) {
      gradH.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
    }
    ctx.fillStyle = gradH;
    ctx.fillRect(0, 0, w, h);

    // White gradient top
    const gradW = ctx.createLinearGradient(0, 0, 0, h);
    gradW.addColorStop(0, "rgba(255,255,255,1)");
    gradW.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradW;
    ctx.fillRect(0, 0, w, h);

    // Black gradient bottom
    const gradB = ctx.createLinearGradient(0, 0, 0, h);
    gradB.addColorStop(0, "rgba(0,0,0,0)");
    gradB.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = gradB;
    ctx.fillRect(0, 0, w, h);
  }

  function getColorAtPosition(x: number, y: number) {
    const canvas = spectrumRef.current;
    if (!canvas) return "#000";
    const ctx = canvas.getContext("2d");
    if (!ctx) return "#000";
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return rgbToHex(pixel[0], pixel[1], pixel[2]);
  }

  // Drag handlers
  function handleSpectrumDown(
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) {
    setDragging(true);
    const rect = spectrumRef.current!.getBoundingClientRect();
    const x =
      "touches" in e
        ? Math.max(0, Math.min(rect.width, (e.touches[0].clientX - rect.left)))
        : Math.max(0, Math.min(rect.width, (e.nativeEvent.offsetX)));
    const y =
      "touches" in e
        ? Math.max(0, Math.min(rect.height, (e.touches[0].clientY - rect.top)))
        : Math.max(0, Math.min(rect.height, (e.nativeEvent.offsetY)));
    setSpectrumPos({ x, y });
    const color = getColorAtPosition(x, y);
    setHexInput(color);
    onChange(color);
  }
  useEffect(() => {
    if (!dragging) return;
    function move(e: MouseEvent | TouchEvent) {
      const canvas = spectrumRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      let x, y;
      if ("touches" in e && (e as TouchEvent).touches.length > 0) {
        x = Math.max(0, Math.min(rect.width, (e as TouchEvent).touches[0].clientX - rect.left));
        y = Math.max(0, Math.min(rect.height, (e as TouchEvent).touches[0].clientY - rect.top));
      } else if ("clientX" in e) {
        x = Math.max(0, Math.min(rect.width, (e as MouseEvent).clientX - rect.left));
        y = Math.max(0, Math.min(rect.height, (e as MouseEvent).clientY - rect.top));
      }
      setSpectrumPos({ x, y });
      const color = getColorAtPosition(x, y);
      setHexInput(color);
      onChange(color);
    }
    function up() { setDragging(false); }
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move as any, { passive: false });
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up as any);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move as any);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up as any);
    };
  }, [dragging]);
  // -----

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {/* Color Grid */}
        <div className="flex flex-col gap-1">
          <span className="text-xs mb-1 px-0.5">Presets</span>
          <div className="flex flex-col gap-1">
            {PAINT_COLORS.map((row, i) => (
              <div key={i} className="flex flex-row gap-1">
                {row.map(col => (
                  <button
                    type="button"
                    key={col}
                    className={`w-6 h-6 rounded border
                      ${value.toLowerCase() === col ? "ring-2 ring-primary border-black" : "border-gray-300"}
                    `}
                    style={{ backgroundColor: col }}
                    aria-label={`Pick ${col}`}
                    onClick={() => {
                      setHexInput(col);
                      setShowSpectrum(false);
                      onChange(col);
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Spectrum */}
        <div className="flex flex-col items-center">
          <span className="text-xs mb-1 px-0.5">Custom</span>
          <div className="relative">
            <canvas
              ref={spectrumRef}
              width={180}
              height={100}
              className="rounded border shadow cursor-crosshair"
              style={{ touchAction: "none" }}
              onMouseDown={handleSpectrumDown}
              onTouchStart={handleSpectrumDown}
            />
            {/* Marker for selected color */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: spectrumPos.x - 7,
                top: spectrumPos.y - 7,
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "2px solid #fff",
                boxShadow: "0 0 4px #0009",
                background: "transparent"
              }}
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            {/* HEX input */}
            <input
              aria-label="Custom HEX"
              className="border rounded px-2 py-1 w-24 text-sm"
              maxLength={7}
              value={hexInput}
              onChange={e => {
                let v = e.target.value.replace(/[^#A-Fa-f0-9]/g, "");
                if (!v.startsWith("#")) v = "#" + v;
                setHexInput(v);
                if (validHex.test(v)) {
                  setShowSpectrum(false);
                  onChange(v);
                }
              }}
              style={{ backgroundColor: hexInput, color: "#fff", borderColor: "#888" }}
            />
            <span className="font-mono text-xs">{hexInput}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

