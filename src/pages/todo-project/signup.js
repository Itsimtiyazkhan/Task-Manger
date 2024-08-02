// pages/signup.js
import Signup from "../../components/todo-project/Signup";
import styles from "./todo.module.css";

const SignupPage = () => {
  return (
    <div className={`${styles.bg_signup}`}>
      <h1 className="text-center fw-bold">Sign Up</h1>
      <Signup />
    </div>
  );
};

export default SignupPage;
