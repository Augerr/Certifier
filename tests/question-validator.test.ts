import { describe, it, expect } from 'vitest';
import { validateQuestions } from '../lib/question-validator';
import type { ExamQuestion } from '@/types/question';

describe('validateQuestions', () => {
  it('detects missing prompt and invalid choices', () => {
    const questions = [
      {
        id: 1,
        prompt: '',
        choices: ['A'],
        correctAnswer: 'A',
        explanation: '',
        category: '',
        difficulty: 'medium',
      },
    ];

    const issues = validateQuestions(questions as unknown as ExamQuestion[]);
    expect(issues.some((i) => i.message.includes('Missing prompt'))).toBe(true);
    expect(issues.some((i) => i.message.includes('between 2 and 4 choices'))).toBe(true);
  });
});
