import React, { useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { Folder, Plus, LayoutDashboard, ListTodo, History, BarChart3, ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import ProjectModal from './ProjectModal';

export default function Sidebar() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  // Safe default in case hook is not fully implemented yet
  const { projects = [], loading = false, error = null, refetch } = useProjects() || {};
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeProject = projects.find(p => p.id === parseInt(projectId, 10) || p.id === projectId);

  const navLinks = projectId ? [
    { name: 'Board', path: `/projects/${projectId}/board`, icon: LayoutDashboard },
    { name: 'Backlog', path: `/projects/${projectId}/backlog`, icon: ListTodo },
    { name: 'Sprints', path: `/projects/${projectId}/sprints`, icon: History },
    { name: 'Analytics', path: `/projects/${projectId}/analytics`, icon: BarChart3 },
  ] : [];

  const handleProjectSuccess = () => {
    setIsProjectModalOpen(false);
    if (refetch) refetch();
  };

  const navClassName = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
      isActive ? 'bg-bg-primary text-text-primary font-medium' : 'text-text-secondary hover:bg-bg-primary/50 hover:text-text-primary'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-bg-secondary border-r border-border w-60">
      <div className="p-4 flex items-center justify-between border-b border-border">
        <h1 className="text-xl font-semibold text-text-primary flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <LayoutDashboard className="w-6 h-6 text-accent-sage" />
          Agile
        </h1>
        {isMobileMenuOpen && (
          <button className="md:hidden text-text-secondary hover:text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {projectId && (
          <div className="px-3 mb-6">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-3">
              {activeProject ? activeProject.name : 'Project Menu'}
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink key={link.name} to={link.path} className={navClassName} onClick={() => setIsMobileMenuOpen(false)}>
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        <div className="px-3">
          <div className="flex items-center justify-between px-3 py-2 group cursor-pointer" onClick={() => setIsProjectsOpen(!isProjectsOpen)}>
            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
              {isProjectsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              Projects
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsProjectModalOpen(true);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-bg-primary rounded text-text-secondary hover:text-text-primary transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {isProjectsOpen && (
            <div className="flex flex-col gap-1 mt-1">
              {loading ? (
                <div className="px-3 py-2 text-sm text-text-muted">Loading projects...</div>
              ) : error ? (
                <div className="px-3 py-2 text-sm text-red-500">Error loading projects</div>
              ) : projects.length === 0 ? (
                <div className="px-3 py-2 text-sm text-text-muted">No projects found</div>
              ) : (
                projects.map((project) => (
                  <NavLink
                    key={project.id}
                    to={`/projects/${project.id}/board`}
                    className={navClassName}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Folder className="w-4 h-4" />
                    <span className="truncate">{project.name}</span>
                  </NavLink>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {isProjectModalOpen && (
        <ProjectModal
          onClose={() => setIsProjectModalOpen(false)}
          onSuccess={handleProjectSuccess}
        />
      )}
    </div>
  );

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        {!isMobileMenuOpen && (
          <button className="p-2 bg-bg-surface border border-border rounded-md shadow-sm text-text-primary" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="hidden md:block h-full shrink-0">
        {sidebarContent}
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/20" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="h-full w-60" onClick={(e) => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
