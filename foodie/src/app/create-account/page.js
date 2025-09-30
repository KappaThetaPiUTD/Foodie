"use client";
import { useState } from "react";
import Image from "next/image";
import Input from "../components/Input";
import Button from "../components/Button";
import LeftPanel from "../components/left-panel";
import RightPanel from "../components/RightPanel";
import Link from "next/link";
import "../globals.css";
import { createUser } from "../firebase/Firebase";



export default function CreateAccount() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function handleUsernameChange(e) {
        setUsername(e.target.value);
    }

    function handleEmailChange(e) {
        setEmail(e.target.value);
    }

    function handlePasswordChange(e) {
        setPassword(e.target.value);
    }

    function handleConfirmPasswordChange(e) {
        setConfirmPassword(e.target.value);
    }

    function validate() {
        setError("");
        if (!username || username.trim().length < 3) {
            setError("Username must be at least 3 characters.");
            return false;
        }
        // Basic email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return false;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return false;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return false;
        }
        return true;
    }

    async function handleCreateAccount() {
        setError("");
        setSuccess("");
        if (!validate()) return;
        setLoading(true);
        try {
            await createUser(email, password, username);
            setSuccess("Account created successfully. You can now sign in.");
            setUsername("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
        } catch (e) {
            console.error(e);
            // Provide friendly error messages where possible
            const message = e?.code || e?.message || "Failed to create account.";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    // Keep some of the original layout but wire up inputs

    return (
        <main className="flex flex-col min-h-screen md:flex-row">
            {/* Left Panel */}
            <LeftPanel />
            {/* Right Panel */}
            <RightPanel
                title="foodie"
                subtitle="Create your account"
                footerText={"Been Here Before?"}
                footerLinkHref="/"
                footerLinkText={"Sign In"}
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
                    <label className="sr-only" htmlFor="email">Email</label>
                    <Input
                        id="email"
                        placeholder="Email"
                        value={email}
                        onChange={handleEmailChange}
                        type="email"
                    />
                    <label className="sr-only" htmlFor="password">
                        Password
                    </label>
                    <Input
                        id="password"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                    <label className="sr-only" htmlFor="confirmPassword">
                        Confirm Password
                    </label>
                    <Input
                        id="confirmPassword"
                        placeholder="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                    />
                    <div className="flex justify-center mt-10">
                        <Button onClick={handleCreateAccount} disabled={loading}>
                            {loading ? "Creating..." : "Create Account"}
                        </Button>
                    </div>
                    {error && (
                        <p className="text-red-600 font-inter font-bold text-center mt-4">{error}</p>
                    )}
                    {success && (
                        <p className="text-green-700 font-inter font-bold text-center mt-4">{success}</p>
                    )}
                </>
            </RightPanel>
        </main>
    );
}