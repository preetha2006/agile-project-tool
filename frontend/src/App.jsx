import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import ProjectOverview from "./pages/ProjectOverview";
import Backlog from "./pages/Backlog";
import SprintBoard from "./pages/SprintBoard";
import SprintDetail from "./pages/SprintDetail";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects/:projectId/board" element={<ProjectOverview />} />
        <Route path="projects/:projectId/backlog" element={<Backlog />} />
        <Route path="projects/:projectId/sprints" element={<SprintBoard />} />
        <Route path="projects/:projectId/sprints/:sprintId" element={<SprintDetail />} />
        <Route path="projects/:projectId/analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}

export default App;
