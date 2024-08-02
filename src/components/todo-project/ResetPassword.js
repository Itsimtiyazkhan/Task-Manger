import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "../../../firebaseConfig"; // Ensure this path is correct

const ResetPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const auth = getAuth(app);

  const getCustomErrorMessage = (errorCode) => {
    const errorMessages = {
      "auth/invalid-email": "The email address is not valid.",
      "auth/user-not-found": "There is no user record corresponding to this email.",
      // Add more custom messages as needed
      default: "An unexpected error occurred. Please try again.",
    };
    return errorMessages[errorCode] || errorMessages.default;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setError(null);
      setMessage("If an account with that email exists, you will receive a password reset email.");
    } catch (error) {
      setError(getCustomErrorMessage(error.code));
    }
  };

  return (
    <div className="reset-password-form">
      <h2>Reset Password</h2>
      <form onSubmit={handleResetPassword}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      {resetEmailSent && !error && <p>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ResetPasswordForm;
