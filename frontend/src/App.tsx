import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ObjectTypes } from './pages/ObjectTypes';
import { LinkTypes } from './pages/LinkTypes';
import { ActionTypes } from './pages/ActionTypes';
import { GraphView } from './pages/GraphView';
import { Settings } from './pages/Settings';
import { AiStudio } from './pages/AiStudio';
import { AgentStudio } from './pages/AgentStudio';
import { IndustryMap } from './pages/IndustryMap';
import { ObjectExplorer } from './pages/ObjectExplorer';
import { OntologyData } from './store/ontologyStore';
import { Toaster } from 'sonner';
import { api } from './api/client';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ontology, setOntology] = useState<OntologyData>({ objectTypes: [], linkTypes: [], actionTypes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getOntology()
      .then(data => setOntology(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const renderContent = () => {
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

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={ontology} onNavigate={setActiveTab} />;
      case 'explorer':
        return <ObjectExplorer data={ontology} />;
      case 'objects':
        return <ObjectTypes data={ontology} onUpdate={setOntology} />;
      case 'links':
        return <LinkTypes data={ontology} onUpdate={setOntology} />;
      case 'actions':
        return <ActionTypes data={ontology} onUpdate={setOntology} />;
      case 'graph':
        return <GraphView data={ontology} />;
      case 'industry':
        return <IndustryMap data={ontology} onNavigate={setActiveTab} />;
      case 'ai':
        return <AiStudio data={ontology} onUpdate={setOntology} />;
      case 'agents':
        return <AgentStudio />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard data={ontology} onNavigate={setActiveTab} />;
    }
  };

  return (
    <>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
      <Toaster position="top-right" richColors />
    </>
  );
}
