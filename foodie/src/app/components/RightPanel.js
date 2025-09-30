import "../globals.css";
import Link from "next/link";

export default function RightPanel({
  title = "foodie",
  subtitle = "",
  children,
  footerText = "",
  footerLinkHref = "/",
  footerLinkText = "",
}) {
  return (
    <div className="w-full md:w-1/2 bg-[#FCFBF8] flex flex-col justify-start items-center pt-[5vh] px-8 md:px-24">
      <div className="w-full max-w-sm md:max-w-[600px]">
        <h1 className="font-bogue text-7xl md:text-9xl text-center">{title}</h1>
        {subtitle && (
          <h3 className="font-bogue text-[#000000]/50 text-2xl md:text-4xl mt-[5vh] py-[1vh] text-center">
            {subtitle}
          </h3>
        )}

        {children}
      </div>
      {footerText && (
        <h5 className="font-inter font-bold text-[#424242]/50 text-sm md:text-1xl mt-5">
          {footerText}
          {footerLinkText && (
            <Link href={footerLinkHref} className="text-[#A5C531] hover:underline ml-2">
              {footerLinkText}
            </Link>
          )}
        </h5>
      )}
    </div>
  );
}
