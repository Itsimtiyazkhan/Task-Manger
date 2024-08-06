// components/withAuth.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";

const withAuth = (Component) => {
  return (props) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user);
          setLoading(false);
        } else {
          router.push("/todo-project/signup");
        }
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) {
      return <div className="text-center d-flex ">Loading...</div>;
    }

    return <Component {...props} user={user} />;
  };
};

export default withAuth;
