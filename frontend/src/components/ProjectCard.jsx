import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "../utils/dateUtils";
import { PROJECT_STATUS } from "../utils/constants";
import { deleteProject } from "../services/projectService";

export default function ProjectCard({ project, onEdit, onDeleted }) {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    try {
      setDeleting(true);
      await deleteProject(project.id);
      if (onDeleted) onDeleted(project.id);
    } catch (err) {
      setDeleting(false);
      setConfirming(false);
      alert("Failed to delete project: " + (err?.response?.data?.detail || err.message));
    }
  };

  return (
    <div
      className="bg-bg-surface border border-border rounded-lg p-5 hover:shadow-sm transition-shadow cursor-pointer flex flex-col h-full"
      onClick={() => navigate(`/projects/${project.id}/board`)}
      onMouseLeave={() => setConfirming(false)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-text-primary line-clamp-1">{project.name}</h3>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(project); }}
              className="p-1.5 text-text-muted hover:text-text-primary rounded-md hover:bg-bg-secondary transition-colors"
              title="Edit project"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`p-1.5 rounded-md transition-colors ${
              confirming
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "text-text-muted hover:text-red-500 hover:bg-bg-secondary"
            }`}
            title={confirming ? "Click again to confirm delete" : "Delete project"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {confirming && (
            <span className="text-xs text-red-500 font-medium whitespace-nowrap">
              {deleting ? "Deleting..." : "Click trash again to confirm"}
            </span>
          )}
        </div>
      </div>

      <p className="text-text-secondary text-sm mb-4 line-clamp-2 flex-1">
        {project.description || "No description provided."}
      </p>

      <div className="flex items-center justify-between text-xs mt-auto pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 text-text-muted">
          <Calendar className="w-3.5 h-3.5" />
          <span>{project.created_at ? formatDate(project.created_at) : "Unknown"}</span>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-bg-secondary text-text-secondary font-medium">
          {PROJECT_STATUS[project.status] || project.status || "Active"}
        </span>
      </div>
    </div>
  );
}
