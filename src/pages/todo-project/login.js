import { useState } from "react";
import { useRouter } from "next/router";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Form, Button, Alert } from "react-bootstrap";
import { auth } from "../../lib/firebase";
import Layout from "../../components/layout/Layout";
import Tags from "../../constants/tags";
import styles from "./todo.module.css";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length > 0;

const getCustomErrorMessage = (errorCode) => {
  const errorMessages = {
    "auth/invalid-email": "The email address is not valid.",
    "auth/user-disabled":
      "The user account has been disabled by an administrator.",
    "auth/user-not-found":
      "There is no user record corresponding to this email. Please create an account.",
    "auth/wrong-password": "The password is incorrect.",
    "auth/weak-password": "The password is too weak.",
    "auth/email-already-in-use":
      "The email address is already in use by another account.",
    "auth/invalid-credential": "The provided credentials are not valid.",
    default: "An unexpected error occurred. Please try again.",
  };

  return errorMessages[errorCode] || errorMessages.default;
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    if (!validateEmail(email)) {
      setEmailError("Invalid email address");
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError("Password cannot be empty");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/todo-project/");
    } catch (error) {
      setError(getCustomErrorMessage(error.code));
    }
  };

  const handleSignup = () => {
    router.push("/todo-project/signup");
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setError(null);
    } catch (error) {
      setError(getCustomErrorMessage(error.code));
    }
  };

  return (
    <Layout
      title={Tags.login.title}
      description={Tags.login.description}
      header={false}
      footer={false}
    >
      <div
        className={`${styles.bg_img} d-flex justify-content-center align-items-center min-vh-100`}
      >
        <Form onSubmit={handleLogin} className="">
          <h1 className="text-center mb-4">Login</h1>
          {error && <Alert variant="danger">{error}</Alert>}
          {resetEmailSent && (
            <Alert variant="success">Password reset email sent!</Alert>
          )}
          <Form.Group controlId="formBasicEmail" className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isInvalid={!!emailError}
            />
            <Form.Control.Feedback type="invalid">
              {emailError}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="formBasicPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isInvalid={!!passwordError}
            />
            <Form.Control.Feedback type="invalid">
              {passwordError}
            </Form.Control.Feedback>
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100 mb-3">
            Login
          </Button>
          <Button
            variant="secondary"
            onClick={handleSignup}
            className="w-100 mb-3"
          >
            Sign Up
          </Button>
          <Button
            variant="link"
            onClick={handleResetPassword}
            className="w-100"
          >
            Reset Password
          </Button>
        </Form>
      </div>
    </Layout>
  );
};

export default LoginPage;
