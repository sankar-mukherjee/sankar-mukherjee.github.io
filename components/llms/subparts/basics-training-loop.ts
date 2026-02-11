import type { LlmSubpart } from '../types';

export const basicsTrainingLoop: LlmSubpart = {
  id: 'minimal-training-loop',
  title: 'Minimal Training Loop',
  description: 'A compact training script to run GPT-0 and the optimized GPT variants.',
  content: [
    'This script wires up the core training loop, loss computation, and optimizer steps for the minimal and optimized GPT models.',
    'Use it as a starting point to reproduce results or add your own training tweaks.',
  ],
  codeLink: 'https://github.com/sankar-mukherjee/LLMCode/blob/main/src/llms/train.py',
};
