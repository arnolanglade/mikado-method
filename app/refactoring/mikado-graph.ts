import httpClient from '@/lib/http-client';
import { getMikadoGraphById, MikadoGraphView } from '@/api/mikado-graph/mikako-graph';

type MikadoGraphData = {
  goal: string,
  done: boolean
  addPrerequisiteToRefactoring: (label: string) => void
};

type PrerequisiteData = {
  label: string,
  status: 'experimenting' | 'done' | 'todo',
  startExperimentation: (prerequisiteId: string) => () => void,
  addPrerequisiteToPrerequisite: (prerequisiteId: string) => (label: string) => void,
  commitChanges: (prerequisiteId: string) => () => void,
};

type Node = {
  id: string,
  type: 'refactoring' | 'prerequisite',
  data: MikadoGraphData | PrerequisiteData,
  parentId?: string,
  position: { x: number, y: number }
};
type Edge = {
  id: string,
  source: string,
  target: string,
};

type MikadoGraph = {
  nodes:Node[],
  edges: Edge[],
};

export const mapResponseToRefactoringGraph = (
  refactoringGraph: MikadoGraphView,
  refactoringActions: { addPrerequisiteToRefactoring: (label: string) => void },
  prerequisiteActions: {
    startExperimentation: (prerequisiteId: string) => () => void,
    addPrerequisiteToPrerequisite: (prerequisiteId: string) => (label: string) => void,
    commitChanges: (prerequisiteId: string) => () => void,
  },
): MikadoGraph => {
  const refactoringNode: Node = {
    id: refactoringGraph.mikadoGraphId,
    type: 'refactoring',
    data: { goal: refactoringGraph.goal, done: refactoringGraph.done, ...refactoringActions },
    position: { x: 0, y: 0 },
  };

  const prerequisiteNodes = refactoringGraph.prerequisites.map((prerequisite): Node => ({
    id: prerequisite.prerequisiteId,
    type: 'prerequisite',
    parentId: prerequisite.parentId,
    data: { label: prerequisite.label, status: prerequisite.status, ...prerequisiteActions },
    position: { x: 0, y: 100 },
  }));

  const edges = refactoringGraph.prerequisites.map((prerequisite): Edge => ({
    id: `${prerequisite.parentId}-${prerequisite.prerequisiteId}`,
    source: prerequisite.parentId,
    target: prerequisite.prerequisiteId,
  }));

  return {
    nodes: [refactoringNode, ...prerequisiteNodes],
    edges,
  };
};

export type MikadoGraphApi = {
  getById: (id: string) => Promise<MikadoGraphView>
  start: (goal: string) => Promise<MikadoGraphView>
  addPrerequisiteToMikadoGraph: (mikadoGraphId: string, label: string) => Promise<MikadoGraphView>
  startExperimentation: (mikadoGraphId: string, prerequisiteId: string) => Promise<MikadoGraphView>
  addPrerequisiteToPrerequisite: (mikadoGraphId: string, prerequisiteId: string, label: string) => Promise<MikadoGraphView>
  commitChanges: (mikadoGraphId: string, prerequisiteId: string) => Promise<MikadoGraphView>
};

const mikadoGraphApi: MikadoGraphApi = {
  getById: async (id: string) => getMikadoGraphById(id),
  start: async (goal: string) => {
    const response = await httpClient.post('/api/mikado-graph', { goal });
    return response.json();
  },
  addPrerequisiteToMikadoGraph: async (mikadoGraphId: string, label: string) => {
    const response = await httpClient.post(
      '/api/mikado-graph/prerequisite/add-to-mikado-graph',
      { mikadoGraphId, label },
    );
    return response.json();
  },
  startExperimentation: async (mikadoGraphId: string, prerequisiteId: string) => {
    const response = await httpClient.post(
      '/api/mikado-graph/prerequisite/start-experimentation',
      { mikadoGraphId, prerequisiteId },
    );
    return response.json();
  },
  addPrerequisiteToPrerequisite: async (mikadoGraphId: string, prerequisiteId: string, label: string) => {
    const response = await httpClient.post(
      '/api/mikado-graph/prerequisite/add-to-prerequisite',
      { mikadoGraphId, prerequisiteId, label },
    );
    return response.json();
  },
  commitChanges: async (mikadoGraphId: string, prerequisiteId: string) => {
    const response = await httpClient.post(
      '/api/mikado-graph/prerequisite/commit-changes',
      { mikadoGraphId, prerequisiteId },
    );
    return response.json();
  },
};

export default mikadoGraphApi;
