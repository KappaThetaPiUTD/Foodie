//left-panel.js

import "../globals.css"
import Image from "next/image";
import Link from "next/link";

export default function LeftPanel({children}) {
    return (
        <div className="w-full md:w-1/2 bg-[#A5C531]/25 flex flex-col justify-center items-center py-8">
                <Link href="/">
                <Image
                    src="/foodie_logo.png"
                    alt="Foodie logo"
                    width={490}
                    height={490}
                    className="w-1/2 max-w-[300px] md:max-w-none md:w-[490px]"
                />
                </Link>
                <h1 className="font-bogue text-2xl md:text-4xl text-[#33322F] text-center mt-4">Finding the Middle Ground</h1>
            </div>
    )
}