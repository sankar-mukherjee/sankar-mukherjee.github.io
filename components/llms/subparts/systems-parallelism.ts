import type { LlmSubpart } from '../types';

export const systemsParallelism: LlmSubpart = {
  id: 'parallelism',
  title: 'Parallelism',
  description: 'How LLM workloads are split across devices for efficient training and inference.',
  meta: {
    lastUpdated: 'February 11, 2026',
    keywords: 'deepspeed, 3d parallelism, llm training systems',
  },
  borderless: true,
  introTitle: 'Why parallelism exists (memory wall)',
  introParagraph:
    'Training modern transformers is constrained by memory capacity per GPU, interconnect bandwidth, and compute utilization. As models scale, a single device cannot efficiently hold parameters, optimizer states, and activations. Parallelism is therefore a scaling requirement. Think of parallelism as distributing work across four axes:',
  introPoints: [
    'batch dimension -> data parallelism',
    'hidden dimension -> tensor parallelism',
    'layer dimension -> pipeline parallelism',
    'sequence dimension -> context or sequence parallelism',
  ],
  content: [],
  figures: [
    {
      title: 'Collective Communication and All-Reduce',
      description:
        'Core distributed communication primitives (broadcast, reduce, all-gather, reduce-scatter, all-reduce) are the building blocks for parallel training, and in practice all-reduce is commonly decomposed into reduce-scatter followed by all-gather for better scaling analysis and implementation.',
      images: [
        {
          src: '/collection_basics.webp',
          alt: 'Collective communication basics diagram',
        },
        {
          src: '/allreduce.webp',
          alt: 'All-reduce as reduce-scatter plus all-gather diagram',
        },
      ],
    },
    {
      title: 'How do we parallelize LLMs? 3 important ideas',
      description:
        'A practical decomposition: split data across workers, split model compute/weights across workers, and split activation work across sequence dimension.',
      groups: [
        {
          header: 'Data parallelism',
          items: [
            {
              title: 'Naive data parallel',
              description:
                'Replicate full parameters, gradients, and optimizer states on every rank; easiest to implement but memory-heavy.',
            },
            {
              title: 'ZeRO 1 - 3',
              description:
                'Shard optimizer states, then gradients, then parameters across data-parallel ranks to progressively cut memory usage.',
            },
          ],
        },
        {
          header: 'Model parallelism',
          items: [
            {
              title: 'Pipeline parallel',
              description:
                'Split model depth into stages across devices and stream micro-batches through the stage graph.',
            },
            {
              title: 'Tensor parallel',
              description:
                'Shard matrix ops inside each layer across ranks and combine partial results with collectives.',
            },
          ],
        },
        {
          header: 'Activation parallelism',
          items: [
            {
              title: 'Sequence parallel',
              description:
                'Partition token-wise activation work across ranks to reduce activation memory and improve long-context scaling.',
            },
          ],
        },
      ],
    },
    {
      title: 'ZeRO',
      description:
        'Traditional data parallel (DP) training replicates parameters, gradients, and optimizer states on every GPU, creating large memory overhead and limiting model scale.',
      src: '/zero.webp',
      alt: 'ZeRO optimizer sharding diagram',
      imageAfterTopicTitle: 'Stages Shown in the Diagram',
      topics: [
        {
          title: 'Core Idea',
          description:
            'ZeRO (Zero Redundancy Optimizer) reduces memory usage by partitioning model states across data-parallel GPUs and reconstructing them only when needed via collective communication (reduce-scatter / all-gather).',
          points: [
            'Each device stores only a shard of the training state instead of a full replica.',
          ],
        },
        {
          title: 'Stages Shown in the Diagram',
          description:
            'The figure shows the progression from full replication to full sharding.',
        },
        {
          title: 'Baseline Data Parallel',
          description: 'Full copy of parameters, gradients, and optimizer states on every GPU.',
          points: ['Highest memory consumption.'],
        },
        {
          title: 'ZeRO Stage 1 (P_os)',
          description: 'Optimizer states are sharded across GPUs.',
          points: [
            'Parameters and gradients remain replicated.',
            'First major memory reduction.',
          ],
        },
        {
          title: 'ZeRO Stage 2 (P_os+g)',
          description: 'Optimizer states and gradients are partitioned.',
          points: ['Further reduction in per-GPU memory.'],
        },
        {
          title: 'ZeRO Stage 3 (P_os+g+p)',
          description: 'Parameters, gradients, and optimizer states are all sharded.',
          points: [
            'Minimal memory footprint per GPU.',
            'Enables training very large models.',
          ],
        },
        {
          title: 'Key Takeaway',
          description: 'Memory usage scales roughly with:',
          points: [
            'memory per gpu approx total model state divided by number of data parallel devices',
            'ZeRO enables multi-billion-parameter training without requiring extremely large per-GPU memory.',
          ],
        },
      ],
    },
    {
      title: 'FSDP Training Workflow Overview',
      description:
        'Fully Sharded Data Parallel (FSDP) reduces memory usage by sharding parameters, gradients, and optimizer states across GPUs, then gathering full weights only when compute requires them.',
      src: '/FSDP.png',
      alt: 'FSDP parameter sharding diagram',
      imageAfterTopicTitle: 'High Level Flow',
      topics: [
        {
          title: 'High Level Flow',
          description:
            'Each FSDP instance (a group of layers) repeats a fixed lifecycle during training.',
          points: [
            'load shard -> all gather weights -> local compute -> free full weights -> reduce scatter grads -> update local shard',
          ],
        },
        {
          title: 'Forward Pass',
          description: 'Forward pass steps per training iteration.',
          points: [
            'Load model shard: each GPU loads only its parameter shard (possibly from CPU if offload is enabled).',
            'All gather weights: GPUs reconstruct full parameters temporarily for compute.',
            'Forward (local compute): each GPU runs forward on its local batch.',
            'Free full weights: full parameters are released after forward; shard remains in memory.',
          ],
        },
        {
          title: 'Backward Pass',
          description: 'Backward pass mirrors the sharded lifecycle.',
          points: [
            'All gather weights again: full parameters are reconstructed for gradient computation.',
            'Backward (local): gradients are computed on each GPU.',
            'Reduce scatter: gradients are averaged/partitioned so each rank keeps only its gradient shard.',
            'Free full weights: full tensors are discarded again to control peak memory.',
          ],
        },
        {
          title: 'Optimizer Step',
          description: 'Updates happen shard-wise, not on fully replicated weights.',
          points: [
            'Update weights (local): each GPU updates only its local parameter shard.',
            'Optional CPU offload can place gradients or optimizer states on host memory.',
          ],
        },
        {
          title: 'Key Concepts Illustrated',
          description: 'Core mechanics shown by the workflow.',
          points: [
            'Parameter sharding is scoped per FSDP instance (layer group).',
            'All gather occurs right before compute.',
            'Reduce scatter follows backward for efficient synchronization.',
            'Memory is saved by freeing full weights immediately after use.',
          ],
        },
        {
          title: 'Key Takeaway',
          description:
            'FSDP trades additional communication (all gather + reduce scatter) for major memory savings, enabling large-model training without full parameter replication on every GPU.',
        },
      ],
    },
    {
      title: '3D Parallelism',
      description:
        'Simple rules of thumb from the literature for combining data, tensor, and pipeline parallelism in practical training setups.',
      src: '/3d_parallelism.png',
      alt: '3D parallelism rules of thumb diagram',
    },
  ],
};
