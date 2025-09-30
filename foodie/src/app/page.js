// page.js

"use client";
import { useState } from "react";
import Image from "next/image";
import Input from "./components/Input";
import Button from "./components/Button";
import Link from "next/link";
import LeftPanel from "./components/left-panel";
import RightPanel from "./components/RightPanel";
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
      <LeftPanel />
      {/* Right Panel */}
      <RightPanel
        title="foodie"
        subtitle="Welcome to foodie!"
        footerText={"New to Foodie?"}
        footerLinkHref="/create-account"
        footerLinkText={"Create Account"}
      >
        <>
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
        </>
      </RightPanel>
    </main>
  );
}