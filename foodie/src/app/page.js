// page.js

"use client";
import { useState } from "react";
import Image from "next/image";
import Input from "./components/Input";
import Button from "./components/Button";
import "./globals.css";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSignIn = () => {
    // Making an API call to an authentication endpoint.
    // Validating the user's input.
    // Handling the response from the server.
    // Redirecting the user to another page upon successful sign-in.
    console.log("Username:", username);
    console.log("Password:", password);
    // Add your sign-in logic here
  };

  return (
    <main className="flex flex-col min-h-screen md:flex-row">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 bg-[#A5C531]/25 flex flex-col justify-center items-center py-8">
        <Image
          src="/foodie_logo.png"
          alt="Foodie logo"
          width={490}
          height={490}
          className="w-1/2 max-w-[300px] md:max-w-none md:w-[490px]"
        />
        <h1 className="font-bogue text-2xl md:text-4xl text-[#33322F] text-center mt-4">Finding the Middle Ground</h1>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 bg-[#FCFBF8] flex flex-col justify-start items-center pt-[5vh] px-8 md:px-24">
        <div className="w-full max-w-sm md:max-w-[600px]">
          <h1 className="font-bogue text-7xl md:text-9xl text-center">foodie</h1>
          <h3 className="font-bogue text-[#000000]/50 text-2xl md:text-4xl mt-[5vh] py-[1vh] text-center">
            Welcome to foodie!
          </h3>

          <label className="sr-only" htmlFor="username">
            Username
          </label>
          <Input 
            id="username" 
            placeholder="Username" 
            value={username}
            onChange={handleUsernameChange}
          />

          <label className="sr-only" htmlFor="password">
            Password
          </label>
          <Input 
            id="password" 
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
          />

          <div className="w-full flex justify-end mb-8 md:mb-[49px]">
            <a
              className="text-[#A5C531] font-bold text-sm md:text-1xl hover:underline mt-2"
              href="/forgot-password"
            >Forgot Password?</a>
          </div>

          <Button onClick={handleSignIn}>Sign In</Button>
        </div>
        <h5 className="font-inter font-bold text-[#424242]/50 text-sm md:text-1xl mt-5">
          New to Foodie? <a href="/create-account" className="text-[#A5C531] hover:underline">Create Account</a>
        </h5>
      </div>
    </main>
  );
}