import { memo } from "react";

const Todo = ({ todos }) => {
  console.log("child render");

  return (
    <div>
      {todos?.map((todo, index) => {
        return <p key={index}>{todo}</p>;
      })}
    </div>
  );
};

export default memo(Todo);
