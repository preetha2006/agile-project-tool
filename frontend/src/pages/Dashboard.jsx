import React, { useState } from "react";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const { projects, loading, error, refetch } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  if (loading) return <LoadingState message="Loading projects..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const openCreate = () => { setEditingProject(null); setIsModalOpen(true); };
  const openEdit = (project) => { setEditingProject(project); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingProject(null); };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-text-primary text-bg-surface rounded hover:bg-text-secondary transition-colors"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to get started."
          actionText="Create Project"
          onAction={openCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={openEdit}
              onDeleted={() => refetch()}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <ProjectModal
          project={editingProject}
          onClose={closeModal}
          onSuccess={() => { closeModal(); refetch(); }}
        />
      )}
    </div>
  );
}
