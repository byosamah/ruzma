/**
 * Finder App Component
 *
 * macOS Finder-style window for browsing projects.
 * Features:
 * - Project list/grid view
 * - Sidebar with categories
 * - Toolbar for actions
 * - Create/Edit project modes
 *
 * This replaces the Projects page in macOS mode.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWindowManager } from '@/contexts/WindowManagerContext';
import { useDashboard } from '@/hooks/useDashboard';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useT } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProjectCard from '@/components/ProjectCard';
import { Search, Grid, List, FolderPlus } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface FinderAppProps {
  /** Window ID (passed by WindowRenderer) */
  windowId?: string;
  /** Optional data passed when opening window */
  data?: Record<string, unknown>;
}

type ViewMode = 'list' | 'grid';
type FilterCategory = 'all' | 'active' | 'completed' | 'archived';

// =============================================================================
// SIDEBAR COMPONENT
// =============================================================================

interface FinderSidebarProps {
  activeCategory: FilterCategory;
  onCategoryChange: (category: FilterCategory) => void;
  projectCounts: Record<FilterCategory, number>;
}

function FinderSidebar({ activeCategory, onCategoryChange, projectCounts }: FinderSidebarProps) {
  const t = useT();
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  const categories: { id: FilterCategory; label: string; icon: string }[] = [
    { id: 'all', label: t('allProjects') || 'All Projects', icon: '📁' },
    { id: 'active', label: t('activeProjects') || 'Active', icon: '🟢' },
    { id: 'completed', label: t('completedProjects') || 'Completed', icon: '✅' },
    { id: 'archived', label: t('archivedProjects') || 'Archived', icon: '📦' },
  ];

  return (
    <div
      className={cn(
        'finder-sidebar w-48 shrink-0 border-r border-gray-200',
        'bg-gray-50/80 backdrop-blur-sm',
        'p-2',
        isRTL && 'border-r-0 border-l'
      )}
    >
      <div className="text-xs font-semibold text-gray-500 uppercase px-2 py-1 mb-1">
        {t('categories') || 'Categories'}
      </div>
      <nav className="space-y-0.5">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-md',
              'text-sm transition-colors',
              activeCategory === category.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-200/70',
              isRTL && 'flex-row-reverse text-right'
            )}
          >
            <span>{category.icon}</span>
            <span className="flex-1">{category.label}</span>
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full',
              activeCategory === category.id
                ? 'bg-white/20'
                : 'bg-gray-200 text-gray-600'
            )}>
              {projectCounts[category.id]}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// =============================================================================
// TOOLBAR COMPONENT
// =============================================================================

interface FinderToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  canCreateProject: boolean;
  onNewProject: () => void;
}

function FinderToolbar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  canCreateProject,
  onNewProject,
}: FinderToolbarProps) {
  const t = useT();
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  return (
    <div
      className={cn(
        'finder-toolbar flex items-center gap-2 px-3 py-2',
        'border-b border-gray-200 bg-gray-50/50',
        isRTL && 'flex-row-reverse'
      )}
    >
      {/* View mode toggles */}
      <div className="flex items-center border rounded-md overflow-hidden">
        <button
          onClick={() => onViewModeChange('list')}
          className={cn(
            'p-1.5 transition-colors',
            viewMode === 'list'
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-500 hover:bg-gray-100'
          )}
          title={t('listView') || 'List View'}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange('grid')}
          className={cn(
            'p-1.5 transition-colors',
            viewMode === 'grid'
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-500 hover:bg-gray-100'
          )}
          title={t('gridView') || 'Grid View'}
        >
          <Grid className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xs">
        <div className="relative">
          <Search className={cn(
            'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400',
            isRTL ? 'right-2' : 'left-2'
          )} />
          <Input
            type="text"
            placeholder={t('searchProjects') || 'Search projects...'}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              'h-8 text-sm',
              isRTL ? 'pr-8' : 'pl-8'
            )}
          />
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* New Project Button */}
      <Button
        size="sm"
        onClick={onNewProject}
        disabled={!canCreateProject}
        className="gap-1"
      >
        <FolderPlus className="w-4 h-4" />
        <span>{t('newProject') || 'New Project'}</span>
      </Button>
    </div>
  );
}

// =============================================================================
// LOADING COMPONENT
// =============================================================================

function FinderLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  );
}

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

interface FinderEmptyProps {
  onNewProject: () => void;
  canCreateProject: boolean;
}

function FinderEmpty({ onNewProject, canCreateProject }: FinderEmptyProps) {
  const t = useT();

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8">
      <div className="text-5xl mb-4">📁</div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        {t('noProjectsYet') || 'No Projects Yet'}
      </h3>
      <p className="text-sm text-gray-500 mb-4 max-w-xs">
        {t('createFirstProjectDesc') || 'Create your first project to get started'}
      </p>
      <Button onClick={onNewProject} disabled={!canCreateProject}>
        <FolderPlus className="w-4 h-4 mr-2" />
        {t('createFirstProject') || 'Create Project'}
      </Button>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function FinderApp({ windowId, data }: FinderAppProps) {
  const { dir } = useLanguage();
  const { openApp } = useWindowManager();
  const t = useT();
  const isRTL = dir === 'rtl';

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');

  // Get projects data
  const {
    profile,
    loading,
    projects,
    userCurrency,
    handleDeleteProject,
  } = useDashboard();

  // Track usage limits
  const usage = useUsageTracking(profile, projects);

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    let result = projects;

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.status === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.client?.name?.toLowerCase().includes(query) ||
          p.brief?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [projects, activeCategory, searchQuery]);

  // Calculate project counts per category
  const projectCounts = useMemo(() => ({
    all: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    archived: projects.filter((p) => p.status === 'archived').length,
  }), [projects]);

  /**
   * Handle creating new project
   */
  const handleNewProject = useCallback(() => {
    if (usage.canCreateProject) {
      // TODO: Open create project sheet/modal
      openApp('create-project');
    }
  }, [usage.canCreateProject, openApp]);

  /**
   * Handle viewing a project
   */
  const handleViewProject = useCallback((projectSlug: string) => {
    openApp('project', { slug: projectSlug });
  }, [openApp]);

  /**
   * Handle editing a project
   */
  const handleEditProject = useCallback((projectSlug: string) => {
    openApp('edit-project', { slug: projectSlug });
  }, [openApp]);

  // Show loading state
  if (loading) {
    return <FinderLoading />;
  }

  return (
    <div
      className={cn(
        'finder-app flex h-full',
        'bg-white',
        isRTL && 'flex-row-reverse'
      )}
      style={{ direction: dir }}
    >
      {/* Sidebar */}
      <FinderSidebar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        projectCounts={projectCounts}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <FinderToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          canCreateProject={usage.canCreateProject}
          onNewProject={handleNewProject}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProjects.length === 0 ? (
            <FinderEmpty
              onNewProject={handleNewProject}
              canCreateProject={usage.canCreateProject}
            />
          ) : viewMode === 'list' ? (
            // List View
            <div className="space-y-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewClick={() => handleViewProject(project.slug)}
                  onEditClick={() => handleEditProject(project.slug)}
                  onDeleteClick={handleDeleteProject}
                  currency={userCurrency.currency}
                  convertFrom={project.currency || project.freelancer_currency}
                  isVerticalLayout={true}
                />
              ))}
            </div>
          ) : (
            // Grid View
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={cn(
                    'p-4 rounded-lg border border-gray-200',
                    'hover:border-blue-300 hover:shadow-sm',
                    'cursor-pointer transition-all',
                    'bg-white'
                  )}
                  onClick={() => handleViewProject(project.slug)}
                >
                  <div className="text-3xl mb-2">📁</div>
                  <h3 className="font-medium text-sm truncate">
                    {project.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {project.client?.name || t('noClient')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinderApp;
