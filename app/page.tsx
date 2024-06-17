'use client'
import Home from "@/components/home";
import { io } from "socket.io-client";

export default function Main() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Home />
    </div>
  )
}
