// Button.js
import "../globals.css"

export default function Button({ children, onClick }) {
  return (
    <button
      // The py-[27px] and px-[239px] values are very specific and likely causing the issue.
      // Replace them with more dynamic Tailwind classes.
      className="w-full bg-[#A5C531] text-[#424242] text-4xl font-inter font-bold py-4 px-8 rounded-[15px] hover:bg-[#8DAA2A] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition-colors duration-300"
      onClick={onClick}
    >
      {children}
    </button>
  );
}