import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
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
import { useState } from "react";
import axios from "axios";
import React from "react";
import toast from "react-hot-toast";
import { token } from "./utils";
import { host } from "./utils/routes";

function App() {
  const [isPostJobEnabled, setIsPostJobEnabled] = useState(false);
  React.useEffect(() => {
    const checkCompanyAccess = async () => {
      const idToken = localStorage.getItem(token);
      if (!idToken) {
        // toast.error("Seems like you are not logged in");
        // setTimeout(() => {
        //   navigate("/sign-in");
        // }, 2000);
        return;
      }

      try {
        console.log("dashboard companyId");
        const response = await axios.get(`${host}/company`, {
          headers: {
            Authorization: idToken,
          },
        });
        if (response.status === 200) {
          setIsPostJobEnabled(true);
          console.log(response.data.id);
        }
      } catch (error) {
        setIsPostJobEnabled(false);
        console.log(error);
      }
    };

    checkCompanyAccess();
  }, []);
  return (
    <Router>
      <Routes>
        <Route element={<Layout isPostJobEnabled={isPostJobEnabled} />}>
          <Route
            path="/dashboard"
            element={<Dashboard isPostJobEnabled={isPostJobEnabled} />}
          />
          <Route path="/post-job" element={<PostJob />} />
          <Route
            path="/manage-jobs"
            element={<ManageJobs isPostJobEnabled={isPostJobEnabled} />}
          />
          <Route path="/candidates/:jobId" element={<Candidates />} />
          {/* <Route path="/leaderboard" element={<Leaderboard />} /> */}
          <Route
            path="/settings"
            element={<Settings setIsPostJobEnabled={setIsPostJobEnabled} />}
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
