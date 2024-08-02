// components/ToDo.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../pages/todo-project/todo.module.css";
import {
  Container,
  Spinner,
  InputGroup,
  Form,
  Button,
  Image,
} from "react-bootstrap";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  getDocs,
  where,
} from "firebase/firestore";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import Layout from "../layout/Layout";
import Tags from "../../constants/tags";
import withAuth from "../../components/todo-project/withAuth"; // Import the HOC
import Link from "next/link";

const TaskItem = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  isEditing,
  editText,
  setEditText,
}) => (
  <div key={task.id} className="d-flex justify-content-between">
    <li
      className={`${styles.taskItem} list-group-item`}
      style={{ color: task.completed ? "red" : "green" }}
    >
      {isEditing ? (
        <>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className={`${styles.input_box} rounded border border-none`}
            style={{
              maxWidth: 400,
              height: "40px",
              boxShadow: "0px 0.5px 4px 5px #E5E5E5",
            }}
          />
          <button
            onClick={onSave}
            className="rounded-3 border border-none"
            style={{ boxShadow: "0px 0.5px 3px 3px #E5E5E5", padding: "5px" }}
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="rounded-3 border border-none"
            style={{ boxShadow: "0px 0.5px 3px 3px #E5E5E5", padding: "5px" }}
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <span
            style={{
              borderBottom: task.completed ? "0.005px solid red" : "none",
              textDecoration: task.completed ? "line-through" : "none",
            }}
            className={`${styles.taskText} my-2`}
          >
            {task.text}
          </span>
          <button
            onClick={onToggle}
            className="rounded-3 border border-none"
            style={{ boxShadow: "0px 0.5px 3px 3px #E5E5E5", padding: "5px" }}
          >
            {task.completed ? "Undo" : "Complete"}
          </button>
          {!task.completed && (
            <button
              onClick={onEdit}
              className="rounded-3 border border-none"
              style={{ boxShadow: "0px 0.5px 3px 3px #E5E5E5", padding: "5px" }}
            >
              Edit
            </button>
          )}
          <button
            onClick={onDelete}
            className="rounded-3 border border-none"
            style={{ boxShadow: "0px 0.5px 3px 3px #E5E5E5", padding: "5px" }}
          >
            Delete
          </button>
        </>
      )}
    </li>
  </div>
);
function Home(props) {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskText, setEditTaskText] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth();
  
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchTasks(user.uid);
      } else {
        setTasks([]);
        setLoading(false);
      }
    });
  }, []);

  const fetchTasks = async (userId) => {
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const tasksData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTasks(tasksData);
    setLoading(false);
  };

  const addTask = async () => {
    if (task.trim() === "") return;

    const user = auth.currentUser;
    const newTask = { text: task, completed: false, userId: user.uid };

    try {
      const docRef = await addDoc(collection(db, "tasks"), newTask);
      setTasks([...tasks, { id: docRef.id, ...newTask }]);
      setTask("");
    } catch (e) {
      console.error("Error adding task: ", e);
    }
  };

  const deleteTask = async (id) => {
    try {
      await deleteDoc(doc(db, "tasks", id));
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (e) {
      console.error("Error deleting task: ", e);
    }
  };

  const toggleTaskCompletion = async (id) => {
    const taskToToggle = tasks.find((task) => task.id === id);
    const updatedTask = { ...taskToToggle, completed: !taskToToggle.completed };

    try {
      await updateDoc(doc(db, "tasks", id), updatedTask);
      setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
    } catch (e) {
      console.error("Error updating task: ", e);
    }
  };

  const editTask = (id, text) => {
    setEditTaskId(id);
    setEditTaskText(text);
  };

  const saveTask = async (id) => {
    const updatedTask = tasks.find((task) => task.id === id);
    const newTask = { ...updatedTask, text: editTaskText };

    try {
      await updateDoc(doc(db, "tasks", id), newTask);
      setTasks(tasks.map((task) => (task.id === id ? newTask : task)));
      setEditTaskId(null);
      setEditTaskText("");
    } catch (e) {
      console.error("Error saving task: ", e);
    }
  };

  const cancelEdit = () => {
    setEditTaskId(null);
    setEditTaskText("");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/todo-project/login"); // redirect to the login page
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };
  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <Layout
      title={Tags.todolist.title}
      description={Tags.todolist.description}
      header={false}
      footer={false}
    >
      <div className={styles.container}>
        <div className={styles.main}>
          <h1 className="text-center fw-bold">To-Do List</h1>
          <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
            <InputGroup
              className={`${styles.input_group} bg-white rounded-3 border border-none`}
              style={{ boxShadow: "0px 0.5px 4px 5px #E5E5E5" }}
            >
              <Form.Control
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className={`inputSearch border-0 ${styles.input}`}
                placeholder="Enter your task here..."
              ></Form.Control>
              <Button
                className={"border-2 px-3 bg-transparent border-none"}
                style={{ color: "black" }}
                onClick={addTask}
              >
                Add Task
              </Button>
            </InputGroup>
          </div>

          <ul className={`${styles.taskList} list-group-numbered mt-3 ms-1`}>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => toggleTaskCompletion(task.id)}
                onEdit={() => editTask(task.id, task.text)}
                onDelete={() => deleteTask(task.id)}
                onSave={() => saveTask(task.id)}
                onCancel={cancelEdit}
                isEditing={editTaskId === task.id}
                editText={editTaskText}
                setEditText={setEditTaskText}
              />
            ))}
          </ul>

          <div className="text-center">
            <Button onClick={handleLogout} className="mt-3 me-3">
              Logout
            </Button>
            <Link href="todo-project/profile">
              <Button className="mt-3">
                {/* <Image
                  src="/assets/images/dashboard/school-Logo.svg"
                  width={35}
                  height={35}
                  alt="cart"
                /> */}
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
export default withAuth(Home);
