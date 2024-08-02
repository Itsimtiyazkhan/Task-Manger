import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import Todo from "@/components/todo-project/Todo";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
   <Todo />
    </>
  );
}
