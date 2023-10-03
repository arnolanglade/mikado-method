import {
  handleAddPrerequisiteToPrerequisite,
  handleAddPrerequisiteToMikadoGraph,
  handleCommitChanges,
  handleGetMikadoGraphById,
  handleStartExperimentation,
  handleStartTask,
  InMemoryClock,
  InMemoryMikadoGraphs,
  MikakoGraph,
  Status,
  UnknownMikadoGraph,
} from '@/api/mikado-graph/mikako-graph';
import { aMikadoGraph } from '@/test/test-utils';
import { v4 as uuidv4 } from 'uuid';

describe('Refactoring use cases', () => {
  test('The developer starts a refactoring', async () => {
    const mikadoGraphId = uuidv4();
    const mikadoGraphs = new InMemoryMikadoGraphs();
    await handleStartTask(mikadoGraphs)({
      mikadoGraphId,
      goal: 'Rework that part',
    });

    expect(await mikadoGraphs.get(mikadoGraphId))
      .toEqual(aMikadoGraph({
        mikadoGraphId,
        goal: 'Rework that part',
      }));
  });

  test('The developer adds a prerequisite to a refactoring', async () => {
    const mikadoGraphId = uuidv4();
    const prerequisiteId = uuidv4();
    const label = 'Change that';
    const mikadoGraphs = new InMemoryMikadoGraphs([aMikadoGraph({
      mikadoGraphId,
      prerequisites: [],
    })]);

    await handleAddPrerequisiteToMikadoGraph(mikadoGraphs)({
      prerequisiteId,
      mikadoGraphId,
      label,
    });

    expect(await mikadoGraphs.get(mikadoGraphId))
      .toEqual(aMikadoGraph({
        mikadoGraphId,
        prerequisites: [{ prerequisiteId, label, status: Status.TODO }],
      }));
  });

  test('The developer starts an experimentation on a todo prerequisite', async () => {
    const mikadoGraphId = uuidv4();
    const prerequisiteId = uuidv4();
    const mikadoGraphs = new InMemoryMikadoGraphs([aMikadoGraph({
      mikadoGraphId,
      prerequisites: [{ prerequisiteId, status: Status.TODO, startedAt: undefined }],
    })]);
    const clock = new InMemoryClock('2023-07-25T10:24:00');

    await handleStartExperimentation(mikadoGraphs, clock)({
      mikadoGraphId,
      prerequisiteId,
    });

    expect(await mikadoGraphs.get(mikadoGraphId))
      .toEqual(aMikadoGraph({
        mikadoGraphId,
        prerequisites: [{ prerequisiteId, status: Status.EXPERIMENTING, startedAt: '2023-07-25T10:24:00' }],
      }));
  });

  test('The developer adds a prerequisite to a prerequisite', async () => {
    const mikadoGraphId = uuidv4();
    const existingPrerequisiteId = uuidv4();
    const prerequisiteId = uuidv4();
    const label = 'Change that';
    const existingPrerequisite = { prerequisiteId: existingPrerequisiteId, status: Status.EXPERIMENTING };
    const mikadoGraphs = new InMemoryMikadoGraphs([aMikadoGraph({
      mikadoGraphId,
      prerequisites: [existingPrerequisite],
    })]);

    await handleAddPrerequisiteToPrerequisite(mikadoGraphs)({
      mikadoGraphId,
      prerequisiteId,
      parentId: existingPrerequisiteId,
      label,
    });

    expect(await mikadoGraphs.get(mikadoGraphId))
      .toEqual(aMikadoGraph({
        mikadoGraphId,
        prerequisites: [
          existingPrerequisite,
          {
            prerequisiteId, parentId: existingPrerequisiteId, label, status: Status.TODO,
          },
        ],
      }));
  });

  test('The developer commits a change when the prerequisite is finished', async () => {
    const mikadoGraphId = uuidv4();
    const prerequisiteId = uuidv4();
    const mikadoGraphs = new InMemoryMikadoGraphs([aMikadoGraph({
      mikadoGraphId,
      prerequisites: [{ prerequisiteId, status: Status.EXPERIMENTING }],
    })]);

    await handleCommitChanges(mikadoGraphs)({
      mikadoGraphId,
      prerequisiteId,
    });

    expect(await mikadoGraphs.get(mikadoGraphId))
      .toEqual(aMikadoGraph({
        mikadoGraphId,
        done: true,
        prerequisites: [{
          prerequisiteId, status: Status.DONE,
        }],
      }));
  });

  test('The developer gets the refactoring information thanks to the id', async () => {
    const mikadoGraphId = uuidv4();
    const prerequisiteId = uuidv4();
    const goal = 'Rework that part';
    const done = false;
    const label = 'Change that';
    const status = Status.TODO;
    const mikadoGraphs = new InMemoryMikadoGraphs([aMikadoGraph({
      mikadoGraphId,
      goal,
      done,
      prerequisites: [{ prerequisiteId, label, status }],
    })]);

    const getMikadoGraphById = handleGetMikadoGraphById(mikadoGraphs);

    expect(await getMikadoGraphById(mikadoGraphId)).toEqual({
      refactoringId: mikadoGraphId,
      goal,
      done,
      prerequisites: [{
        prerequisiteId, label, status, parentId: mikadoGraphId, startedAt: undefined,
      }],
    });
  });
});

describe('Refactoring', () => {
  it('creates a refactoring without any prerequisite when a refactoring is started', () => {
    const mikadoGraphId = uuidv4();
    const goal = 'Rework that part';
    const mikakoGraph = MikakoGraph.start(mikadoGraphId, goal);

    expect(mikakoGraph).toEqual(aMikadoGraph({
      mikadoGraphId,
      goal,
      prerequisites: [],
    }));
  });

  it('raises an error if a refactoring is created with an empty goal', () => {
    expect(() => MikakoGraph.start(uuidv4(), ''))
      .toThrow(new Error('The goal cannot be empty'));
  });

  it('adds a prerequisite to a refactoring (its status is todo)', () => {
    const mikadoGraphId = uuidv4();
    const prerequisiteId = uuidv4();
    const label = 'Change that';
    const mikakoGraph = aMikadoGraph({
      mikadoGraphId,
      prerequisites: [],
    });

    mikakoGraph.addPrerequisiteToMikadoGraph(prerequisiteId, label);

    expect(mikakoGraph).toEqual(aMikadoGraph({
      mikadoGraphId,
      prerequisites: [{
        prerequisiteId,
        label,
        status: Status.TODO,
        parentId: mikadoGraphId,
      }],
    }));
  });

  it('raises an error if a prerequisite is added to refactoring with an empty label', () => {
    const mikakoGraph = aMikadoGraph({});

    expect(() => mikakoGraph.addPrerequisiteToMikadoGraph(uuidv4(), ''))
      .toThrow(new Error('The label cannot be empty'));
  });

  it('adds a prerequisite to an existing prerequisite (its status is todo)', () => {
    const prerequisiteId = uuidv4();
    const parentId = uuidv4();
    const label = 'Change that';
    const existingPrerequisite = { prerequisiteId };
    const mikakoGraph = aMikadoGraph({
      prerequisites: [existingPrerequisite],
    });

    mikakoGraph.addPrerequisiteToPrerequisite(prerequisiteId, parentId, label);

    expect(mikakoGraph).toEqual(aMikadoGraph({
      prerequisites: [
        existingPrerequisite,
        {
          prerequisiteId,
          parentId,
          label,
          status: Status.TODO,
        }],
    }));
  });

  it('raises an error if a prerequisite is added to existing prerequisite with an empty label', () => {
    const mikakoGraph = aMikadoGraph({});

    expect(() => mikakoGraph.addPrerequisiteToPrerequisite(uuidv4(), uuidv4(), ''))
      .toThrow(new Error('The label cannot be empty'));
  });

  it('start an experimentation on a todo prerequisite', () => {
    const prerequisiteId = uuidv4();
    const mikakoGraph = aMikadoGraph({
      prerequisites: [{
        prerequisiteId, status: Status.TODO, startedAt: undefined,
      }],
    });

    mikakoGraph.startExperimentation(prerequisiteId, new Date('2023-07-25T10:24:00'));

    expect(mikakoGraph).toEqual(aMikadoGraph({
      prerequisites: [{
        prerequisiteId,
        status: Status.EXPERIMENTING,
        startedAt: '2023-07-25T10:24:00',
      }],
    }));
  });

  test.each([
    Status.EXPERIMENTING,
    Status.DONE,
  ])('raises an error if  an experimentation is started on a "%s" prerequisite', async (status) => {
    const prerequisiteId = uuidv4();
    const mikakoGraph = aMikadoGraph({
      prerequisites: [{
        prerequisiteId, status, startedAt: undefined,
      }],
    });

    expect(() => mikakoGraph.startExperimentation(prerequisiteId, new Date('2023-07-25T10:24:00')))
      .toThrow(new Error('You can only start an experimentation an a todo prerequisite'));
  });

  describe('commit changes', () => {
    it('commits a change after finishing an experimentation', () => {
      const prerequisiteId = uuidv4();
      const todoPrerequisite = { prerequisiteId: uuidv4(), status: Status.TODO };
      const mikakoGraph = aMikadoGraph({
        prerequisites: [
          { prerequisiteId, status: Status.EXPERIMENTING },
          todoPrerequisite,
        ],
      });

      mikakoGraph.commitChanges(prerequisiteId);

      expect(mikakoGraph).toEqual(aMikadoGraph({
        done: false,
        prerequisites: [
          { prerequisiteId, status: Status.DONE },
          todoPrerequisite,
        ],
      }));
    });

    it('finishes the refactoring after committing the last changes', () => {
      const prerequisiteId = uuidv4();
      const mikakoGraph = aMikadoGraph({
        prerequisites: [{ prerequisiteId, status: Status.EXPERIMENTING }],
      });

      mikakoGraph.commitChanges(prerequisiteId);

      expect(mikakoGraph).toEqual(aMikadoGraph({
        done: true,
        prerequisites: [{
          prerequisiteId,
          status: Status.DONE,
        }],
      }));
    });

    it.each([
      Status.TODO,
      Status.DONE,
    ])('raises an error if changes are committed to a "%s" prerequisite', async (status) => {
      const prerequisiteId = uuidv4();
      const mikakoGraph = aMikadoGraph({
        prerequisites: [{ prerequisiteId, status }],
      });

      expect(() => mikakoGraph.commitChanges(prerequisiteId))
        .toThrow(new Error('Chances can only be committed on a experimenting prerequisite'));
    });

    it('turns a refactoring into a format used by the UI to render it', () => {
      const mikakoGraph = aMikadoGraph({
        mikadoGraphId: '51bb1ce3-d1cf-4d32-9d10-8eea626f4784',
        goal: 'My goal',
        done: false,
        prerequisites: [{
          prerequisiteId: '0472c1c9-7a75-4f7a-9b79-9cd18e60005a',
          label: 'Do this',
          status: Status.TODO,
          startedAt: '2023-07-25T10:24:00.000Z',
          parentId: 'fce08bae-3c28-4d9b-afe9-9ff920605d32',
        }],
      });

      expect(mikakoGraph.render())
        .toEqual({
          refactoringId: '51bb1ce3-d1cf-4d32-9d10-8eea626f4784',
          goal: 'My goal',
          done: false,
          prerequisites: [{
            prerequisiteId: '0472c1c9-7a75-4f7a-9b79-9cd18e60005a',
            label: 'Do this',
            status: Status.TODO,
            startedAt: '2023-07-25T10:24:00.000Z',
            parentId: 'fce08bae-3c28-4d9b-afe9-9ff920605d32',
          }],
        });
    });
  });

  describe('identifyBy', () => {
    it('says yes if the given id match the refactoring id', () => {
      const mikadoGraphId = uuidv4();
      const mikakoGraph = aMikadoGraph({ mikadoGraphId });

      expect(mikakoGraph.identifyBy(mikadoGraphId))
        .toEqual(true);
    });

    it('says no if the given id does not match the refactoring id', () => {
      const mikakoGraph = aMikadoGraph({ mikadoGraphId: '51bb1ce3-d1cf-4d32-9d10-8eea626f4784' });

      expect(mikakoGraph.identifyBy('c2e2ddf8-534b-4080-b47c-0f4536b54cae'))
        .toEqual(false);
    });
  });

  describe('equals', () => {
    it('says yes if the given refactoring object equals this one', () => {
      const mikadoGraphId = uuidv4();
      const mikakoGraph = aMikadoGraph({ mikadoGraphId });

      expect(mikakoGraph.equals(aMikadoGraph({ mikadoGraphId })))
        .toEqual(true);
    });

    it('says no if the given refactoring object does not equals this one', () => {
      const mikakoGraph = aMikadoGraph({ mikadoGraphId: '51bb1ce3-d1cf-4d32-9d10-8eea626f4784' });

      expect(mikakoGraph.equals(aMikadoGraph({ mikadoGraphId: 'c2e2ddf8-534b-4080-b47c-0f4536b54cae' })))
        .toEqual(false);
    });
  });
});

describe('mikadoGraphs', () => {
  it('persists a refactoring', async () => {
    const mikadoGraphId = uuidv4();
    const mikadoGraphs = new InMemoryMikadoGraphs();

    await mikadoGraphs.add(aMikadoGraph({ mikadoGraphId }));

    expect(await mikadoGraphs.get(mikadoGraphId))
      .toEqual(aMikadoGraph({ mikadoGraphId }));
  });

  it('raises an error if the given id does not match an existing refactoring', async () => {
    const mikadoGraphs = new InMemoryMikadoGraphs([
      aMikadoGraph({ mikadoGraphId: '51bb1ce3-d1cf-4d32-9d10-8eea626f4784' }),
    ]);

    await expect(mikadoGraphs.get('c2e2ddf8-534b-4080-b47c-0f4536b54cae')).rejects.toThrow(
      new UnknownMikadoGraph(
        'The mikado graph with the id c2e2ddf8-534b-4080-b47c-0f4536b54cae does not exist',
      ),
    );
  });
});
