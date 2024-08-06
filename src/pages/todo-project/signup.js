// pages/signup.js
import Signup from "../../components/todo-project/Signup";
import styles from "./todo.module.css";

const SignupPage = () => {
  return (
    <div
      className={`${styles.bg_signup}`}
      style={{ backgroundColor: "rgb(182 210 247)", height: "100vh" }}
    >
      <h1 className="text-center fw-bold ">Sign Up</h1>
      <Signup />
    </div>
  );
};

export default SignupPage;
