// components/Signup.js
import { useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { doc, namedQuery, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Form, Button, Alert, Spinner, Image } from "react-bootstrap";
import Layout from "../layout/Layout";
import Tags from "../../constants/tags";
import { app } from "../../../firebaseConfig";
import styles from "../../pages/todo-project/todo.module.css";
const getCustomErrorMessage = (errorCode) => {
  const errorMessages = {
    "auth/invalid-email": "The email address is not valid.",
    "auth/user-disabled":
      "The user account has been disabled by an administrator.",
    "auth/user-not-found":
      "There is no user record corresponding to this email.",
    "auth/wrong-password": "The password is incorrect.",
    "auth/weak-password": "The password is too weak.",
    "auth/email-already-in-use":
      "The email address is already in use by another account.",
    "auth/invalid-credential": "The provided credentials are not valid.",
    // Add more custom messages as needed
    default: "An unexpected error occurred. Please try again.",
  };

  return errorMessages[errorCode] || errorMessages.default;
};

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const auth = getAuth(app);
  const router = useRouter(); // Initialize useRouter

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailError("");
    setMobileError("");

    if (!validateEmail(email)) {
      setEmailError("Invalid email address");
      setLoading(false);
      return;
    }

    if (!validateMobile(mobile)) {
      setMobileError("Mobile number must be 10 digits");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      let imageURL = "";
      if (image) {
        // Upload image to Firebase Storage
        const storage = getStorage(app);
        const imageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(imageRef, image);
        imageURL = await getDownloadURL(imageRef);
      }

      // Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        mobile: mobile,
        age: age,
        email: email,
        profilePicture: imageURL, // Save image URL
      });

      setMessage("User signed up and additional data saved");
      router.push("/todo-project"); // Redirect to login after successful signup
    } catch (error) {
      console.error("Error signing up:", error);
      setMessage(getCustomErrorMessage(error.code) || error.message);
    }
    setLoading(false);
  };
  const handleLogin = () => {
    router.push("/todo-project/login");
  };

  return (
    <Layout
      title={Tags.signup.title}
      description={Tags.signup.description}
      header={false}
      footer={false}
    >
      <div className="d-flex flex-wrap align-items-center justify-content-center ">
        <div className="col-12 col-md-5 d-none d-md-block align-items-center justify-content-center ">
          <Image
            src="/assets/3d-illustration-pen-putting-blue-ticks-paper.jpg"
            width={2000}
            height={200}
            alt=""
            className="img-fluid border border-5"
          />
        </div>
        <div
          className={`d-flex justify-content-center align-items-center col-12 col-md-6 mt-0 mt-md-4 p-2 p-md-0`}
        >
          <Form onSubmit={handleSignup} className="">
            <Form.Group controlId="Name" className="mb-2">
              <Form.Label className="fw-bold">Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicEmail" className="mb-2">
              <Form.Label className="fw-bold">Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {emailError && (
                <Alert variant="danger" className="mt-2">
                  {emailError}
                </Alert>
              )}
            </Form.Group>

            <Form.Group controlId="formBasicPassword" className="mb-2">
              <Form.Label className="fw-bold">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formBasicMobile" className="mb-2">
              <Form.Label className="fw-bold">Mobile</Form.Label>
              <Form.Control
                type="text"
                placeholder="Mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />

              {mobileError && (
                <Alert variant="danger" className="mt-2">
                  {mobileError}
                </Alert>
              )}
            </Form.Group>

            <Form.Group controlId="formBasicMobile" className="mb-2">
              <Form.Label className="fw-bold">Age</Form.Label>
              <Form.Control
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </Form.Group>

            {/* <button type="submit">Sign Up</button> */}
            <Form.Group controlId="formBasicImage" className="mb-2">
              <Form.Label className="fw-bold">Profile Picture</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mb-2">
              {loading ? <Spinner animation="border" /> : "Sign Up"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleLogin}
              className="w-100 mb-2"
            >
              Login
            </Button>
            {message && (
              <Alert variant="info" className="mt-3">
                {message}
              </Alert>
            )}
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
