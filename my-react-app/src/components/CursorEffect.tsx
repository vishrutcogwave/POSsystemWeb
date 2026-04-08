import { useEffect, useRef } from "react";

export default function CursorEffect() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[9999] transition-transform duration-75 ease-out"
    >
      <div className="w-10 h-10 border border-gray-400 rounded-full flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );
}