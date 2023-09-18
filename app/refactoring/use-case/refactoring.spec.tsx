'use client';

import { act, renderHook } from '@testing-library/react';
import useRefactoring from '@/refactoring/use-case/refactoring';
import { jest } from '@jest/globals';
import {
  aNotifier, aRefactoringApi, aRouter, createWrapper,
} from '@/test/test-utils';
import refactoringApi from '@/refactoring/refactoring';
import { v4 as uuidv4 } from 'uuid';

describe('useRefactoring', () => {
  describe('start refactoring', () => {
    test('The developer starts a refactoring', async () => {
      const start = jest.fn() as jest.Mocked<typeof refactoringApi.start>;
      const { result } = renderHook(useRefactoring, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ start }),
          },
        ),
      });

      await act(() => result.current.startRefactoring('Refactor method'));

      expect(start).toHaveBeenCalledWith('Refactor method');
    });

    test('The developer is redirected to the refactoring page', async () => {
      const push = jest.fn();
      const refactoringId = uuidv4();
      const { result } = renderHook(useRefactoring, {
        wrapper: createWrapper(
          {
            useRouter: aRouter({ push }),
            refactoringApi: aRefactoringApi({ start: async () => refactoringId }),
          },
        ),
      });

      await act(() => result.current.startRefactoring('Refactor method'));

      expect(push).toHaveBeenCalledWith(`/refactoring/${refactoringId}`);
    });

    test('The developer is notified that everything went well', async () => {
      const success = jest.fn();
      const { result } = renderHook(useRefactoring, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ start: async () => uuidv4() }),
            useNotification: aNotifier({ success }),
          },
          { 'refactoring.notification.success': 'The refactoring has been started' },
        ),
      });

      await act(() => result.current.startRefactoring('Refactor method'));

      expect(success).toHaveBeenCalledWith('The refactoring has been started');
    });

    test('The developer is notified that something went wrong', async () => {
      const error = jest.fn();
      const { result } = renderHook(useRefactoring, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({
              start: async () => {
                throw Error();
              },
            }),
            useNotification: aNotifier({ error }),
          },
          { 'refactoring.notification.error': 'Something went wrong' },
        ),
      });

      await act(() => result.current.startRefactoring('Refactor method'));

      expect(error).toHaveBeenCalledWith('Something went wrong');
    });
  });

  describe('add prerequisite', () => {
    test('The developer add a prerequisite', async () => {
      const addPrerequisite = jest.fn() as jest.Mocked<typeof refactoringApi.addPrerequisite>;
      const refactoringId = uuidv4();
      const prerequisiteLabel = 'Do that';
      const { result } = renderHook(useRefactoring, {
        wrapper: createWrapper(
          { refactoringApi: aRefactoringApi({ addPrerequisite }) },
        ),
      });

      await act(() => result.current.addPrerequisite(
        refactoringId,
        prerequisiteLabel,
      ));

      expect(addPrerequisite).toHaveBeenCalledWith(refactoringId, prerequisiteLabel);
    });

    test('The refactoring graph is refresh after adding a prerequisite', async () => {
      const refresh = jest.fn();

      const { result } = renderHook(useRefactoring, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ addPrerequisite: async () => uuidv4() }),
            useRouter: aRouter({ refresh }),
          },
        ),
      });

      await act(() => result.current.addPrerequisite(
        uuidv4(),
        'Do this',
      ));

      expect(refresh).toHaveBeenCalled();
    });

    test('The developer is notified that everything went well', async () => {
      const success = jest.fn();
      const { result } = renderHook(useRefactoring, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ addPrerequisite: async () => uuidv4() }),
            useNotification: aNotifier({ success }),
          },
          { 'refactoring.prerequisite.notification.success': 'The prerequisite has been added' },
        ),
      });

      await act(() => result.current.addPrerequisite(
        uuidv4(),
        'Do this',
      ));

      expect(success).toHaveBeenCalledWith('The prerequisite has been added');
    });

    test('The developer is notified that something went wrong', async () => {
      const error = jest.fn();
      const { result } = renderHook(useRefactoring, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({
              addPrerequisite: async () => {
                throw Error();
              },
            }),
            useNotification: aNotifier({ error }),
          },
          { 'refactoring.prerequisite.notification.error': 'Something went wrong' },
        ),
      });

      await act(() => result.current.addPrerequisite(
        uuidv4(),
        'Do this',
      ));

      expect(error).toHaveBeenCalledWith('Something went wrong');
    });
  });

  describe('start experimentation', () => {
    test('The developer starts an experimentation', async () => {
      const startExperimentation = jest.fn() as jest.Mocked<typeof refactoringApi.startExperimentation>;
      const refactoringId = uuidv4();
      const prerequisiteId = uuidv4();
      const { result } = renderHook(useRefactoring, {
        wrapper: createWrapper(
          { refactoringApi: aRefactoringApi({ startExperimentation }) },
        ),
      });

      await act(() => result.current.startExperimentation(
        refactoringId,
        prerequisiteId,
      ));

      expect(startExperimentation).toHaveBeenCalledWith(refactoringId, prerequisiteId);
    });

    test('The refactoring graph is refresh after starting an experimentation', async () => {
      const refresh = jest.fn();
      const { result } = renderHook(useRefactoring, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ startExperimentation: async () => {} }),
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

    test('The developer is notified that everything went well', async () => {
      const success = jest.fn();
      const { result } = renderHook(useRefactoring, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({ startExperimentation: async () => {} }),
            useNotification: aNotifier({ success }),
          },
          { 'refactoring.prerequisite.start.notification.success': 'The experimentation has started' },
        ),
      });

      await act(() => result.current.startExperimentation(
        uuidv4(),
        uuidv4(),
      ));

      expect(success).toHaveBeenCalledWith('The experimentation has started');
    });

    test('The developer is notified that something went wrong', async () => {
      const error = jest.fn();
      const { result } = renderHook(useRefactoring, {
        wrapper: createWrapper(
          {
            refactoringApi: aRefactoringApi({
              startExperimentation: async () => {
                throw Error();
              },
            }),
            useNotification: aNotifier({ error }),
          },
          { 'refactoring.prerequisite.start.notification.error': 'Something went wrong' },
        ),
      });

      await act(() => result.current.startExperimentation(
        uuidv4(),
        uuidv4(),
      ));

      expect(error).toHaveBeenCalledWith('Something went wrong');
    });
  });
});
