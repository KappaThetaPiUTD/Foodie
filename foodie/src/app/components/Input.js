export default function Input({ id, placeholder, value, onChange, type = "text" }) {
  return (
    <input
      className="outline-none focus:border-[#A5C531] focus:scale-[1.02] w-full max-w-[600px] font-bold text-[#424242] placeholder:text-[#000000]/25 placeholder:font-bold focus:placeholder:text-[#000000]/50 font-inter bg-transparent mt-[50px] border-b border-[#424242]/30 transition-all duration-500 ease-out"
      type={type}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}