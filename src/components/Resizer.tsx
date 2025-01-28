import React, { useState, useEffect, useCallback } from "react";

interface ResizerProps {
  onResize: (newSize: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

const Resizer = ({ onResize, minWidth = 200, maxWidth = 800 }: ResizerProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleResize = useCallback(
    (clientX: number) => {
      const newWidth = Math.max(minWidth, Math.min(maxWidth, clientX));
      onResize(newWidth);
    },
    [minWidth, maxWidth, onResize]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleResize(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleResize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div className="relative h-full select-none">
      {/* Drag Handle Area */}
      <div
        className="absolute inset-y-0 left-1/2 w-6 transform -translate-x-1/2 cursor-col-resize hover:bg-gray-300"
        onMouseDown={handleMouseDown}
        title="Drag to resize" // Tooltip for better UX
      />

      {/* Darker and Thicker Vertical Line */}
      <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-[2px] bg-gray-200" />
    </div>
  );
};

export default Resizer;
