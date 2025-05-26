import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { PostJob } from "./pages/PostJob";
import { ManageJobs } from "./pages/ManageJobs";
import { Candidates } from "./pages/Candidates";
// import { Leaderboard } from "./pages/Leaderboard";
import { Settings } from "./pages/Settings";
import { SignUp } from "./pages/SignUp";
import { SignIn } from "./pages/SignIn";
import Landing from "./pages/Landing";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { token } from "./utils";
import { host } from "./utils/routes";
import { query, where, getDocs } from "firebase/firestore";
import { phoneCollection } from "./utils/firebaseConfig";

function App() {
  const [isPostJobEnabled, setIsPostJobEnabled] = useState(false);
  const [isPhoneNumber, setIsPhoneNumber] = useState(false);
  const [companyId, setcomppanyId] = useState("");
  useEffect(() => {
    const checkCompanyAccess = async () => {
      const idToken = localStorage.getItem(token);
      if (!idToken) {
        return;
      }

      try {
        console.log("dashboard companyId");
        const response = await axios.get(`${host}/company`, {
          headers: {
            Authorization: idToken,
          },
        });
        setcomppanyId(response.data.id);
        // console.log(response.data.id);
        setIsPostJobEnabled(true);
      } catch (error) {
        setIsPostJobEnabled(false);
        console.log(error);
      }
    };

    checkCompanyAccess();
  }, []);

  const checkPhoneNumber = async (companyId: string) => {
    try {
      if (!companyId) return;
      console.log("PhoneNum");
      const q = query(phoneCollection, where("companyId", "==", companyId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty && querySnapshot.docs[0].data().phoneNumber) {
        setIsPhoneNumber(true);
      } else {
        setIsPhoneNumber(false);
      }
    } catch (error) {
      console.error("Error checking phone number:", error);
      setIsPhoneNumber(false);
      toast.error("Failed to check phone number status.");
    }
  };

  useEffect(() => {
    checkPhoneNumber(companyId);
  }, [companyId]);

  // useEffect(() => console.log("req", isPhoneNumber), [isPhoneNumber]);
  // useEffect(() => {
  //   console.log("Enable", isPostJobEnabled);
  // }, [isPostJobEnabled]);
  return (
    <Router>
      <Routes>
        <Route
          element={
            <Layout
              isPostJobEnabled={isPostJobEnabled}
              isPhoneNumber={isPhoneNumber}
            />
          }
        >
          <Route
            path="/dashboard"
            element={
              <Dashboard
                checkPhoneNumber={checkPhoneNumber}
                isPhoneNumber={isPhoneNumber}
                isPostJobEnabled={isPostJobEnabled}
                setIsPostJobEnabled={setIsPostJobEnabled}
              />
            }
          />
          <Route path="/post-job" element={<PostJob />} />
          <Route
            path="/manage-jobs"
            element={
              <ManageJobs
                isPostJobEnabled={isPostJobEnabled}
                isPhoneNumber={isPhoneNumber}
              />
            }
          />
          <Route path="/candidates/:jobId" element={<Candidates />} />
          {/* <Route path="/leaderboard" element={<Leaderboard />} /> */}
          <Route
            path="/settings"
            element={
              <Settings
                checkPhoneNumber={checkPhoneNumber}
                setIsPostJobEnabled={setIsPostJobEnabled}
                isPhoneNumber={isPhoneNumber}
                setIsPhoneNumber={setIsPhoneNumber}
              />
            }
          />
        </Route>
        <Route path="/" element={<Landing />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
