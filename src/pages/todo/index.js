import Todo from "@/components/Todo/Todo";
import React, { useState } from "react";
import { memo } from "react";
const index = () => {
  const [count, setCount] = useState(0);
  //   const [todos, setTodos] = useState(["todo 1", "todo 2"]);
  const handlclick = () => {
    setCount((c) => c + 1);
  };
  console.log("counter");
  return (
    <div className="d-flex align-items-center m-2">
      {/* <Todo todos={todos} /> */}

      <h3>Count : {count}</h3>
      <button className="px-4" onClick={handlclick}>
        +
      </button>
    </div>
  );
};

export default memo(index);
