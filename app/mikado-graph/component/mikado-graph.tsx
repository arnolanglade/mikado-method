'use client';

import React, { useEffect } from 'react';
import { StatusView } from '@/api/mikado-graph/mikado-graph';
import AddPrerequisiteForm from '@/mikado-graph/component/add-prerequisite-form';
import { Translation } from '@/tools/i18n/intl-provider';
import {
  Controls, Handle, MiniMap, Position, ReactFlow, useEdgesState, useNodesState,
} from 'reactflow';
import {
  GaolData, MikadoGraph, NewPrerequisiteData, PrerequisiteData,
} from '@/mikado-graph/mikado-graph.usecase';
import Typography from '@/tools/design-system/typography';
import 'reactflow/dist/style.css';
import { Button, ButtonGroup } from '@/tools/design-system/form';
import Alert from '@/tools/design-system/alert';
import styles from './mikado-graph.module.css';

export function AddNewPrerequisiteNode({
  data: { onPrerequisiteSubmit },
} : {
  data: NewPrerequisiteData,
}) {
  return (
    <div className={styles.container}>
      <Handle type="target" position={Position.Top} />
      <AddPrerequisiteForm onSubmit={onPrerequisiteSubmit} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function GoalNode({
  data: { goal, done, addPrerequisiteToMikadoGraph },
} : {
  data: GaolData,
}) {
  return (
    <div className={styles.container}>
      <Typography variant="p">
        <Translation id="mikado-graph.your-goal" values={{ goal }} />
      </Typography>
      {
        done ? (
          <Alert severity="success">
            <Translation id="mikado-graph.done" />
          </Alert>
        ) : <AddPrerequisiteForm onSubmit={addPrerequisiteToMikadoGraph} />
      }
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function PrerequisiteNode({
  id,
  data: {
    label,
    status,
    canBeCommitted,
    displayPrerequisiteForm,
    startExperimentation,
    addPrerequisiteToPrerequisite,
    commitChanges,
  },
}: {
  id: string,
  data: PrerequisiteData
}) {
  const [displayForm, setDisplayForm] = React.useState(displayPrerequisiteForm || false);

  const displayOrHiddenPrerequisiteForm = () => {
    setDisplayForm(!displayForm);
  };

  const hidePrerequisiteForm = () => {
    setDisplayForm(false);
  };

  return (
    <div
      className={styles.container}
      key={id}
    >
      <Handle type="target" position={Position.Top} />
      <Typography variant="p">
        <Translation id="prerequisite.label" values={{ label }} />
      </Typography>
      {
        status === StatusView.DONE && (
          <Alert severity="success">
            <Translation id="prerequisite.done" />
          </Alert>
        )
      }
      {status === StatusView.TODO && (
      <Button variant="primary" onClick={startExperimentation}>
        <Translation id="prerequisite.start-experimentation" />
      </Button>
      )}

      { !displayForm && status === StatusView.EXPERIMENTING && (
        <ButtonGroup>
          <Button variant="primary" onClick={displayOrHiddenPrerequisiteForm}>
            <Translation id="prerequisite.add" />
          </Button>
          { canBeCommitted && (
          <Button variant="primary" onClick={commitChanges}>
            <Translation id="prerequisite.commit-changes" />
          </Button>
          )}
        </ButtonGroup>
      )}

      { displayForm && status === StatusView.EXPERIMENTING && (
      <AddPrerequisiteForm
        onSubmit={addPrerequisiteToPrerequisite}
        onCancel={hidePrerequisiteForm}
      />
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = {
  prerequisite: PrerequisiteNode,
  goal: GoalNode,
  newPrerequisite: AddNewPrerequisiteNode,
};

export default function Graph({
  mikadoGraph,
}: {
  mikadoGraph: MikadoGraph,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(mikadoGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(mikadoGraph.edges);

  useEffect(() => {
    setEdges(mikadoGraph.edges);
    setNodes(mikadoGraph.nodes);
  }, [mikadoGraph]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 3 }}
    >
      <Controls />
      <MiniMap zoomable pannable />
    </ReactFlow>
  );
}
