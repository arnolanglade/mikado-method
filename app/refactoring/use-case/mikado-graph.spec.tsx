'use client';

import { act, renderHook } from '@testing-library/react';
import useMikadoGraph from '@/refactoring/use-case/mikado-graph';
import { jest } from '@jest/globals';
import {
  aNotifier, aRefactoringApi, aMikadoGraphView, aRouter, createWrapper,
} from '@/test/test-utils';
import refactoringApi from '@/refactoring/mikado-graph';
import { v4 as uuidv4 } from 'uuid';

describe('useMikadoGraph', () => {
  describe('start task', () => {
    test('The developer is notified after starting a mikado graph that everything went well', async () => {
      const success = jest.fn();
      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ start: async () => aMikadoGraphView() }),
            useNotification: aNotifier({ success }),
          },
          { 'mikado-graph.notification.success.start': 'The mikado graph has been started' },
        ),
      });

      await act(() => result.current.startRefactoring('Refactor method'));

      expect(success).toHaveBeenCalledWith('The mikado graph has been started');
    });

    test('The developer is redirected to the mikado graph page', async () => {
      const push = jest.fn();
      const refactoringId = uuidv4();
      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            useRouter: aRouter({ push }),
            refactoringApi: aRefactoringApi({ start: async () => aMikadoGraphView({ refactoringId }) }),
          },
        ),
      });

      await act(() => result.current.startRefactoring('Refactor method'));

      expect(push).toHaveBeenCalledWith(`/refactoring/${refactoringId}`);
    });

    test('The developer is notified that something went wrong', async () => {
      const error = jest.fn();
      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({
              start: async () => {
                throw Error();
              },
            }),
            useNotification: aNotifier({ error }),
          },
          { 'notification.error': 'Something went wrong' },
        ),
      });

      await act(() => result.current.startRefactoring('Refactor method'));

      expect(error).toHaveBeenCalledWith('Something went wrong');
    });
  });

  describe('add prerequisite to a refactoring', () => {
    test('The developer is notified after adding a prerequisite that everything went well', async () => {
      const addPrerequisiteToRefactoring = jest.fn() as jest.Mocked<typeof refactoringApi.addPrerequisiteToRefactoringMikadoGraph>;
      const success = jest.fn();
      const refactoringId = uuidv4();
      const prerequisiteLabel = 'Do that';
      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ addPrerequisiteToRefactoringMikadoGraph: addPrerequisiteToRefactoring }),
            useNotification: aNotifier({ success }),
          },
          { 'prerequisite.notification.add-prerequisite.success': 'The prerequisite has been added' },
        ),
      });

      await act(() => result.current.addPrerequisiteToRefactoring(
        refactoringId,
        prerequisiteLabel,
      ));

      expect(addPrerequisiteToRefactoring).toHaveBeenCalledWith(refactoringId, prerequisiteLabel);
      expect(success).toHaveBeenCalledWith('The prerequisite has been added');
    });

    test('The refactoring graph is refresh after adding a prerequisite', async () => {
      const refresh = jest.fn();

      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ addPrerequisiteToRefactoringMikadoGraph: async () => aMikadoGraphView() }),
            useRouter: aRouter({ refresh }),
          },
        ),
      });

      await act(() => result.current.addPrerequisiteToRefactoring(
        uuidv4(),
        'Do this',
      ));

      expect(refresh).toHaveBeenCalled();
    });

    test('The developer is notified that something went wrong', async () => {
      const error = jest.fn();
      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({
              addPrerequisiteToRefactoringMikadoGraph: async () => {
                throw Error();
              },
            }),
            useNotification: aNotifier({ error }),
          },
          { 'notification.error': 'Something went wrong' },
        ),
      });

      await act(() => result.current.addPrerequisiteToRefactoring(
        uuidv4(),
        'Do this',
      ));

      expect(error).toHaveBeenCalledWith('Something went wrong');
    });
  });

  describe('add prerequisite to a prerequisite', () => {
    test('The developer is notified after adding a prerequisite that everything went well', async () => {
      const addPrerequisiteToPrerequisite = jest.fn() as jest.Mocked<typeof refactoringApi.addPrerequisiteToPrerequisite>;
      const success = jest.fn();
      const refactoringId = uuidv4();
      const prerequisiteId = uuidv4();
      const prerequisiteLabel = 'Do that';
      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ addPrerequisiteToPrerequisite }),
            useNotification: aNotifier({ success }),
          },
          { 'prerequisite.notification.add-prerequisite.success': 'The prerequisite has been added' },
        ),
      });

      await act(() => result.current.addPrerequisiteToPrerequisite(
        refactoringId,
        prerequisiteId,
        prerequisiteLabel,
      ));

      expect(addPrerequisiteToPrerequisite).toHaveBeenCalledWith(refactoringId, prerequisiteId, prerequisiteLabel);
      expect(success).toHaveBeenCalledWith('The prerequisite has been added');
    });

    test('The refactoring graph is refresh after adding a prerequisite', async () => {
      const refresh = jest.fn();

      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ addPrerequisiteToPrerequisite: async () => aMikadoGraphView() }),
            useRouter: aRouter({ refresh }),
          },
        ),
      });

      await act(() => result.current.addPrerequisiteToPrerequisite(
        uuidv4(),
        uuidv4(),
        'Do this',
      ));

      expect(refresh).toHaveBeenCalled();
    });

    test('The developer is notified that something went wrong', async () => {
      const error = jest.fn();
      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({
              addPrerequisiteToPrerequisite: async () => {
                throw Error();
              },
            }),
            useNotification: aNotifier({ error }),
          },
          { 'notification.error': 'Something went wrong' },
        ),
      });

      await act(() => result.current.addPrerequisiteToPrerequisite(
        uuidv4(),
        uuidv4(),
        'Do this',
      ));

      expect(error).toHaveBeenCalledWith('Something went wrong');
    });
  });

  describe('start experimentation', () => {
    test('The developer is notified after starting an experimentation that everything went well', async () => {
      const success = jest.fn();
      const refactoringId = uuidv4();
      const prerequisiteId = uuidv4();
      const startExperimentation = jest.fn() as jest.Mocked<typeof refactoringApi.startExperimentation>;

      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ startExperimentation }),
            useNotification: aNotifier({ success }),
          },
          { 'prerequisite.notification.start-experimentation.success': 'The experimentation has started' },
        ),
      });

      await act(() => result.current.startExperimentation(
        refactoringId,
        prerequisiteId,
      ));

      expect(startExperimentation).toHaveBeenCalledWith(refactoringId, prerequisiteId);
      expect(success).toHaveBeenCalledWith('The experimentation has started');
    });

    test('The refactoring graph is refresh after starting an experimentation', async () => {
      const refresh = jest.fn();
      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ startExperimentation: async () => aMikadoGraphView() }),
            useRouter: aRouter({ refresh }),
          },
        ),
      });

      await act(() => result.current.startExperimentation(
        uuidv4(),
        uuidv4(),
      ));

      expect(refresh).toHaveBeenCalled();
    });

    test('The developer is notified that something went wrong', async () => {
      const error = jest.fn();
      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({
              startExperimentation: async () => {
                throw Error();
              },
            }),
            useNotification: aNotifier({ error }),
          },
          { 'notification.error': 'Something went wrong' },
        ),
      });

      await act(() => result.current.startExperimentation(
        uuidv4(),
        uuidv4(),
      ));

      expect(error).toHaveBeenCalledWith('Something went wrong');
    });
  });

  describe('commit changes', () => {
    test('The developer is notified after commit changes that everything went well', async () => {
      const success = jest.fn();
      const refactoringId = uuidv4();
      const prerequisiteId = uuidv4();

      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ commitChanges: async () => aMikadoGraphView({ done: false }) }),
            useNotification: aNotifier({ success }),
          },
          { 'prerequisite.notification.add-prerequisite.success': 'Changes committed' },
        ),
      });

      await act(() => result.current.commitChanges(
        refactoringId,
        prerequisiteId,
      ));

      expect(success).toHaveBeenCalledWith('Changes committed');
    });

    test('The developer is notified after commit changes that the refactoring is done', async () => {
      const success = jest.fn();

      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ commitChanges: async () => aMikadoGraphView({ done: true }) }),
            useNotification: aNotifier({ success }),
          },
          { 'mikado-graph.done': 'Refactoring done' },
        ),
      });

      await act(() => result.current.commitChanges(
        uuidv4(),
        uuidv4(),
      ));

      expect(success).toHaveBeenCalledWith('Refactoring done');
    });

    test('The refactoring graph is refresh after committing changes', async () => {
      const refresh = jest.fn();
      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ commitChanges: async () => aMikadoGraphView() }),
            useRouter: aRouter({ refresh }),
          },
        ),
      });

      await act(() => result.current.commitChanges(
        uuidv4(),
        uuidv4(),
      ));

      expect(refresh).toHaveBeenCalled();
    });

    test('The developer is notified that something went wrong', async () => {
      const error = jest.fn();
      const { result } = renderHook(useMikadoGraph, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({
              commitChanges: async () => {
                throw Error();
              },
            }),
            useNotification: aNotifier({ error }),
          },
          { 'notification.error': 'Something went wrong' },
        ),
      });

      await act(() => result.current.commitChanges(
        uuidv4(),
        uuidv4(),
      ));

      expect(error).toHaveBeenCalledWith('Something went wrong');
    });
  });
});
