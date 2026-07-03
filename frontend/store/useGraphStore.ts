import { create } from 'zustand';

interface GraphState {
    projectId: string | null;
    nodes: any[];
    edges: any[];
    isLoading: boolean;
    error: string | null;
    fetchGraph: (projectId: string) => Promise<void>;
    addNode: (node: any) => void;
    removeNode: (nodeId: string) => void;
    clearGraph: () => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
    projectId: null,
    nodes: [],
    edges: [],
    isLoading: false,
    error: null,

    fetchGraph: async (projectId: string) => {
        // Only fetch if project ID changes, or if manually refreshed
        set({ isLoading: true, error: null, projectId });
        try {
            const res = await fetch(`/api/projects/${projectId}/graph`);
            if (!res.ok) throw new Error('Failed to fetch graph data');
            const data = await res.json();
            
            // Expected data format: { nodes: [...], edges: [...] }
            set({ 
                nodes: data.nodes || [], 
                edges: data.edges || [],
                isLoading: false 
            });
        } catch (err: any) {
            console.error('Graph fetch error:', err);
            set({ error: err.message, isLoading: false });
        }
    },

    addNode: (node: any) => {
        set((state) => ({
            nodes: [...state.nodes.filter(n => n.id !== node.id), node]
        }));
    },

    removeNode: (nodeId: string) => {
        set((state) => ({
            nodes: state.nodes.filter(n => n.id !== nodeId),
            edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
        }));
    },

    clearGraph: () => {
        set({ nodes: [], edges: [], projectId: null });
    }
}));
