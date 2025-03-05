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

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/manage-jobs" element={<ManageJobs />} />
          <Route path="/candidates/:jobId" element={<Candidates />} />
          {/* <Route path="/leaderboard" element={<Leaderboard />} /> */}
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
