import type { LlmPart } from './types';
import { basicsGpt0 } from './subparts/basics-gpt0';
import { basicsArchitecturalOptimizations } from './subparts/basics-architectural-optimizations';
import { basicsTrainingLoop } from './subparts/basics-training-loop';
import { systemsParallelism } from './subparts/systems-parallelism';

export const llmParts: LlmPart[] = [
  {
    id: 'basics',
    title: 'Basics',
    summary: 'Foundations of how transformers work and the key math behind them.',
    subparts: [basicsGpt0, basicsArchitecturalOptimizations, basicsTrainingLoop],
  },
  {
    id: 'systems',
    title: 'Systems',
    summary: 'Inference pipelines, serving, and performance trade-offs.',
    subparts: [systemsParallelism],
  },
  {
    id: 'scaling-laws',
    title: 'Scaling Laws',
    summary: 'How data, model size, and compute shape performance.',
    subparts: [],
  },
  {
    id: 'data',
    title: 'Data',
    summary: 'Collection, cleaning, filtering, and dataset design.',
    subparts: [],
  },
  {
    id: 'alignment',
    title: 'Alignment',
    summary: 'Safety, preference tuning, and instruction following.',
    subparts: [],
  },
];
