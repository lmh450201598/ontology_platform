import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ObjectTypes } from './pages/ObjectTypes';
import { LinkTypes } from './pages/LinkTypes';
import { ActionTypes } from './pages/ActionTypes';
import { FunctionTypes } from './pages/FunctionTypes';
import { GraphView } from './pages/GraphView';
import { Settings } from './pages/Settings';
import { AiStudio } from './pages/AiStudio';
import { AgentStudio } from './pages/AgentStudio';
import { ObjectExplorer } from './pages/ObjectExplorer';
import { OntologyRules } from './pages/OntologyRules';
import { OntologyData } from './store/ontologyStore';
import { Toaster } from 'sonner';
import { api } from './api/client';
import { Loader2 } from 'lucide-react';

// 路由映射表
export const ROUTES = {
  dashboard: '/',
  graph: '/graph',
  objects: '/objects',
  explorer: '/explorer',
  links: '/links',
  actions: '/actions',
  rules: '/rules',
  functions: '/functions',
  agents: '/agents',
  settings: '/settings',
} as const;

// 将路径映射回 tab id
const PATH_TO_TAB: Record<string, string> = {
  '/': 'dashboard',
  '/graph': 'graph',
  '/objects': 'objects',
  '/explorer': 'explorer',
  '/links': 'links',
  '/actions': 'actions',
  '/rules': 'rules',
  '/functions': 'functions',
  '/agents': 'agents',
  '/settings': 'settings',
};

// 获取当前 tab 从路径
function getTabFromPath(pathname: string): string {
  return PATH_TO_TAB[pathname] || 'dashboard';
}

// 包装组件，提供数据和导航功能
function PageWrapper({ 
  children, 
  ontology, 
  setOntology, 
  loading, 
  error 
}: { 
  children: React.ReactNode;
  ontology: OntologyData;
  setOntology: (data: OntologyData) => void;
  loading: boolean;
  error: string | null;
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading ontology...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">Failed to connect to API server</p>
          <p className="text-slate-500 text-sm">{error}</p>
          <p className="text-slate-400 text-xs mt-2">Make sure the backend is running: <code className="font-mono bg-slate-100 px-1 rounded">npm run dev:server</code></p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// 主应用内容
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [ontology, setOntology] = useState<OntologyData>({ objectTypes: [], linkTypes: [], actionTypes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeTab = getTabFromPath(location.pathname);

  useEffect(() => {
    api.getOntology()
      .then(data => setOntology(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleNavigate = (tab: string) => {
    const path = ROUTES[tab as keyof typeof ROUTES];
    if (path) {
      navigate(path);
    }
  };

  return (
    <Layout activeTab={activeTab} onNavigate={handleNavigate}>
      <Routes>
        <Route path="/" element={
          <PageWrapper ontology={ontology} setOntology={setOntology} loading={loading} error={error}>
            <Dashboard data={ontology} onNavigate={handleNavigate} />
          </PageWrapper>
        } />
        <Route path="/graph" element={
          <PageWrapper ontology={ontology} setOntology={setOntology} loading={loading} error={error}>
            <GraphView data={ontology} />
          </PageWrapper>
        } />
        <Route path="/objects" element={
          <PageWrapper ontology={ontology} setOntology={setOntology} loading={loading} error={error}>
            <ObjectTypes data={ontology} onUpdate={setOntology} />
          </PageWrapper>
        } />
        <Route path="/explorer" element={
          <PageWrapper ontology={ontology} setOntology={setOntology} loading={loading} error={error}>
            <ObjectExplorer data={ontology} />
          </PageWrapper>
        } />
        <Route path="/links" element={
          <PageWrapper ontology={ontology} setOntology={setOntology} loading={loading} error={error}>
            <LinkTypes data={ontology} onUpdate={setOntology} />
          </PageWrapper>
        } />
        <Route path="/actions" element={
          <PageWrapper ontology={ontology} setOntology={setOntology} loading={loading} error={error}>
            <ActionTypes data={ontology} onUpdate={setOntology} />
          </PageWrapper>
        } />
        <Route path="/rules" element={
          <PageWrapper ontology={ontology} setOntology={setOntology} loading={loading} error={error}>
            <OntologyRules />
          </PageWrapper>
        } />
        <Route path="/functions" element={
          <PageWrapper ontology={ontology} setOntology={setOntology} loading={loading} error={error}>
            <FunctionTypes />
          </PageWrapper>
        } />
        <Route path="/agents" element={
          <PageWrapper ontology={ontology} setOntology={setOntology} loading={loading} error={error}>
            <AgentStudio />
          </PageWrapper>
        } />
        <Route path="/settings" element={
          <PageWrapper ontology={ontology} setOntology={setOntology} loading={loading} error={error}>
            <Settings />
          </PageWrapper>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}
