"use client";
import Image from "next/image";
import Input from "./components/Input";
import Button from "./components/Button";
import "./globals.css";

export default function Home() {
  return (
    <main className="min-h-screen flex ">
      {/* Left Panel */}
      <div className="w-1/2 bg-[#A5C531]/25 flex justify-center items-center ">
        <Image
          src="/foodie_logo.png"
          alt="Foodie logo"
          width={490}
          height={490}
        />
      </div>

      {/* Right Panel */}
      {/* The `items-center` class was removed from this container */}
      <div className="w-1/2 bg-[#FCFBF8] flex flex-col justify-start items-center pt-[65px] px-24">
        {/* I've added a new container here for the form elements */}
        <div className="w-full max-w-[600px]">
          <h1 className="font-bogue text-9xl text-center">foodie</h1>
          <h3 className="font-bogue text-[#000000]/50 text-4xl mt-[77px] py-[20px] text-center">
            Welcome to foodie!
          </h3>

          <label className="sr-only" htmlFor="username">
            Username
          </label>
          <Input id="username" placeholder="Username" />

          <label className="sr-only" htmlFor="password">
            Password
          </label>
          <Input id="password" placeholder="Password" />

          {/* This div now correctly aligns the "Forgot Password?" link to the right */}
          <div className="w-full flex justify-end mb-[49px]">
            <a
              className="text-[#A5C531] font-bold text-1xl hover:underline"
              href="/forgot-password"
            >
              Forgot Password?
            </a>
          </div>

          <Button onClick={() => {}}>Sign In</Button>
        </div>
        <h5 className="font-inter font-bold text-[#424242]/50 text-1xl mt-[20px]">
          New to Foodie? <a href="/sign-up" className="text-[#A5C531] hover:underline">Create Account</a>
        </h5>
      </div>
    </main>
  );
}