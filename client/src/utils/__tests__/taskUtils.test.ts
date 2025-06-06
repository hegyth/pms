import { TASK_PRIORITIES, TASK_STATUSES, validateTaskForm, transformTaskData } from '../taskUtils';
import type { User } from '../../api/types';

describe('taskUtils', () => {
  describe('TASK_PRIORITIES', () => {
    it('should have correct priority values', () => {
      expect(TASK_PRIORITIES).toEqual([
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' },
      ]);
    });
  });

  describe('TASK_STATUSES', () => {
    it('should have correct status values', () => {
      expect(TASK_STATUSES).toEqual([
        { value: 'Backlog', label: 'Backlog' },
        { value: 'InProgress', label: 'In progress' },
        { value: 'Done', label: 'Done' },
      ]);
    });
  });

  describe('validateTaskForm', () => {
    const validData = {
      title: 'Test Task',
      description: 'Test Description',
      boardId: 1,
      priority: 'Medium' as const,
      status: 'Backlog' as const,
      assigneeId: 1,
    };

    it('should return true for valid data in create mode', () => {
      expect(validateTaskForm(validData, false)).toBe(true);
    });

    it('should return true for valid data in edit mode', () => {
      expect(validateTaskForm(validData, true)).toBe(true);
    });

    it('should return false when required fields are missing in create mode', () => {
      const invalidData = { ...validData, title: '' };
      expect(validateTaskForm(invalidData, false)).toBe(false);
    });

    it('should return false when boardId is missing in create mode', () => {
      const invalidData = { ...validData, boardId: undefined };
      expect(validateTaskForm(invalidData, false)).toBe(false);
    });

    it('should return true when boardId is missing in edit mode', () => {
      const invalidData = { ...validData, boardId: undefined };
      expect(validateTaskForm(invalidData, true)).toBe(true);
    });
  });

  describe('transformTaskData', () => {
    const mockUsers: User[] = [
      {
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        description: 'Test user',
        avatarUrl: 'https://example.com/avatar.jpg',
        teamId: 1,
        teamName: 'Test Team',
        tasksCount: 0,
      },
    ];

    const validData = {
      title: 'Test Task',
      description: 'Test Description',
      boardId: 1,
      priority: 'Medium' as const,
      status: 'Backlog' as const,
      assigneeId: 1,
    };

    it('should transform data correctly with existing user', () => {
      const result = transformTaskData(validData, mockUsers);
      expect(result).toEqual({
        ...validData,
        id: 0,
        assignee: {
          id: 1,
          fullName: 'John Doe',
          email: 'john@example.com',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
        boardName: '',
      });
    });

    it('should transform data correctly with non-existing user', () => {
      const result = transformTaskData(validData, []);
      expect(result).toEqual({
        ...validData,
        id: 0,
        assignee: {
          id: 0,
          fullName: '',
          email: '',
          avatarUrl: '',
        },
        boardName: '',
      });
    });

    it('should use provided taskId when available', () => {
      const result = transformTaskData(validData, mockUsers, 123);
      expect(result.id).toBe(123);
    });
  });
}); 