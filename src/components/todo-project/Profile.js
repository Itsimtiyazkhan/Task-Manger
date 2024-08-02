import { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { db, storage } from "../../lib/firebase"; // Ensure storage is imported
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Ensure correct imports
import { jsPDF } from "jspdf"; // Import jsPDF
import Layout from "../layout/Layout";
import Tags from "../../constants/tags";
import { Image, Spinner, Button, Form, Alert } from "react-bootstrap";
import styles from "../../pages/todo-project/todo.module.css";
import { useRouter } from "next/router";

const TaskList = ({ tasks }) => (
  <ul className={`${styles.taskList} list-group-numbered mt-3 ms-1`}>
    {tasks.map((task) => (
      <li
        key={task.id}
        className={`${styles.taskItem} list-group-item h-50 `}
        style={{ color: task.completed ? "red" : "green" }}
      >
        <span
          className="text-start ms-2"
          style={{
            borderBottom: task.completed ? "0.005px solid red" : "none",
            textDecoration: task.completed ? "line-through" : "none",
          }}
        >
          {task.text}
        </span>
      </li>
    ))}
  </ul>
);

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [age, setAge] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [message, setMessage] = useState(null);
  const auth = getAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        // Fetch user data
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);
          setName(userData.name || "");
          setMobile(userData.mobile || "");
          setAge(userData.age || "");
          setProfilePicture(userData.profilePicture || null);
        }

        // Fetch user's tasks
        const q = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const tasksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(tasksData);
      }
      setLoading(false);
    };

    fetchData();
  }, [auth]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 1000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleGoBack = () => {
    setLoading(true); // Set loading state before navigation
    router.push("/todo-project");
  };

  const toggleTasksVisibility = () => {
    setShowTasks((prevShowTasks) => !prevShowTasks);
  };

  const handleEditToggle = () => {
    setEditing((prevEditing) => !prevEditing);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        const updatedData = { name, mobile, age };

        if (profilePicture) {
          const storageRef = ref(storage, `profilePictures/${user.uid}`);
          await uploadBytes(storageRef, profilePicture);
          const profilePictureUrl = await getDownloadURL(storageRef);
          updatedData.profilePicture = profilePictureUrl;
        } else {
          updatedData.profilePicture = userData.profilePicture;
        }

        await updateDoc(userRef, updatedData);
        setMessage("Profile updated successfully!");
        setUserData({ ...userData, ...updatedData });
        setEditing(false);
      } catch (error) {
        setMessage(`Error updating profile: ${error.message}`);
      }
    }
    setLoading(false);
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/todo-project/login"); // redirect to the login page
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Task List", 10, 10);

    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const maxWidth = pageWidth - 2 * margin;

    const defaultLineHeight = 10;
    const adjustedLineHeight = 7;

    tasks.forEach((task) => {
      doc.setFontSize(12);
      const text = `${task.text} - ${task.completed ? "Completed" : "Incomplete"}`;
      const textLines = doc.splitTextToSize(text, maxWidth);
      const lineHeight =
        text.length > 50 ? adjustedLineHeight : defaultLineHeight;
      textLines.forEach((line) => {
        if (yPosition + lineHeight > doc.internal.pageSize.height) {
          // If there's no more room on the page, add a new page
          doc.addPage();
          yPosition = margin; // Reset yPosition for the new page
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight; // Move down for the next line
      });
    });
    doc.save("Your-task-list.pdf");
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Layout
      title={Tags.todoprofile.title}
      description={Tags.todoprofile.description}
      header={false}
      footer={false}
    >
      <div className={`${styles.container} `}>
        <div className={`${styles.main} `}>
          {/* <h1 className="fw-bold text-center">Profile</h1> */}
          {userData ? (
            <>
              <div>
                {userData.profilePicture && (
                  <Image
                    src={userData.profilePicture}
                    alt="Profile"
                    className=" border border-2"
                    width={200}
                    height={200}
                  />
                )}
              </div>
              <div>
                <h2>{userData.name}</h2>
                {message && <Alert variant="info">{message}</Alert>}
                {editing ? (
                  <Form onSubmit={handleProfileUpdate} className="mt-3">
                    <Form.Group controlId="formName" className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group controlId="formMobile" className="mb-3">
                      <Form.Label>Mobile</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Mobile"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group controlId="formAge" className="mb-3">
                      <Form.Label>Age</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group controlId="formProfilePicture" className="mb-3">
                      <Form.Label>Profile Picture</Form.Label>
                      <Form.Control
                        type="file"
                        onChange={(e) => setProfilePicture(e.target.files[0])}
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100">
                      Update Profile
                    </Button>
                  </Form>
                ) : (
                  <>
                    <p>Email: {userData.email}</p>
                    <p>Mobile: {userData.mobile}</p>
                    <p>Age: {userData.age}</p>
                  </>
                )}
                <div className="">
                  <Button
                    variant="secondary"
                    onClick={handleGoBack}
                    className="mt-4 me-2"
                  >
                    Go Back
                  </Button>
                  <Button onClick={toggleTasksVisibility} className="mt-4 me-2">
                    {showTasks ? "Hide Tasks" : "Show Tasks"}
                  </Button>
                  <Button onClick={handleEditToggle} className="mt-4 me-2">
                    {editing ? "Cancel" : "Edit Profile"}
                  </Button>
                  <Button onClick={handleLogout} className="mt-4 me-2">
                    Logout
                  </Button>
                  <Button onClick={generatePDF} className="mt-4 me-2">
                    Download PDF
                  </Button>
                </div>
              </div>

              <div className="mt-2 ">
                <h3>Tasks</h3>
                {showTasks && (
                  <>
                    <TaskList tasks={tasks} />
                  </>
                )}
              </div>
            </>
          ) : (
            <p className="text-center">No user data found</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
