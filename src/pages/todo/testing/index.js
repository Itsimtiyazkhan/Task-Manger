import Car from "@/components/Todo/Car";
import React from "react";

const index = () => {
  const cars = ["thar", "venue", "swift", "creta"];
  return (
    <div>
      {cars.map((car) => (
        <Car brand={car} />
      ))}
    </div>
  );
};

export default index;
