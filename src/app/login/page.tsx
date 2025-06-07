// app/login/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // You would normally validate credentials here
    if (email && password) {
        alert('Form submittd');
      router.push("/dashboard");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" name="email"/>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" name="password" />
      <button type="submit">Login</button>
    </form>
  );
}
    