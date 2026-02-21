import React from 'react';

const experience = [
  {
    company: 'Omilia',
    role: 'Senior Machine Learning Engineer (Remote)',
    period: 'Aug 2023 - Oct 2025',
    points: [
      'Improved multilingual production ASR to 9% WER on noisy traffic via Whisper large-v3 LoRA adaptation and error analysis.',
      'Increased domain entity recall in streaming ASR with decoder-level context biasing for RNNT (Parakeet-TDT) without retraining.',
      'Built layered evaluation framework (MOS/MUSHRA, WER intelligibility, pronunciation, latency) for safe TTS rollout.',
      'Reduced multilingual TTS latency to 120ms TTFA and 0.1 RTF by optimizing StyleTTS2 inference with caching and ONNX TensorRT.',
      'Achieved 1.01% EER on ASVspoof 2019 by modifying Whisper AudioEncoder with layer-wise aggregation.',
    ],
  },
  {
    company: 'Oxolo',
    role: 'Machine Learning Engineer (Remote)',
    period: 'Jun 2022 - Jan 2023',
    points: [
      'Reduced non-autoregressive TTS inference latency to sub-30ms with FastPitch decoder and duration-control redesign.',
      'Lowered acoustic model inference cost by 35% RTF using windowed self-attention and silence-aware length regulation.',
      'Enabled zero-shot voice cloning from about one minute of reference audio with speaker-conditioned style-disentangled TTS.',
      'Delivered robust 15-class speech emotion recognition with self-supervised speech embeddings and leakage-aware evaluation.',
    ],
  },
  {
    company: 'GOODIX Technology INC.',
    role: 'Audio & Voice Algorithm Engineer',
    period: 'Apr 2021 - Mar 2022',
    points: [
      'Applied structured pruning and post-training INT8 quantization for a speech enhancement LSTM, reducing model size by 4x while preserving speech quality metrics.',
    ],
  },
  {
    company: 'DefinedCrowd Corp.',
    role: 'Speech Scientist',
    period: 'Sep 2019 - Mar 2021',
    points: [
      'Built multilingual acoustic models and data pipelines for large-scale ASR development.',
      'Developed audio event detection and speech processing models for noisy conversational speech.',
    ],
  },
];

const skills = [
  'ASR, TTS, Speech LLMs',
  'Whisper, RNNT, Diffusion',
  'Model evaluation and robustness analysis',
  'PyTorch, TensorFlow, Docker',
  'Streaming inference and low-latency optimization',
];

export const Resume: React.FC = () => {
  return (
    <div className="fade-in space-y-10">
      <section className="space-y-3">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-lightest-slate font-sans">
          Resume
        </h2>
        <div className="text-sm text-gray-700 dark:text-light-slate flex flex-wrap gap-x-4 gap-y-1">
          <a href="https://github.com/sankar-mukherjee" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
          <a href="https://www.linkedin.com/in/mukherjeesankar/" target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>
          <a href="https://scholar.google.com/citations?user=BlcU8PYAAAAJ&hl=en" target="_blank" rel="noreferrer" className="hover:underline">Google Scholar</a>
        </div>
      </section>

      <section className="space-y-5">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-lightest-slate">Experience</h3>
        <div className="space-y-6">
          {experience.map((job) => (
            <article key={`${job.company}-${job.period}`} className="rounded-xl border border-gray-200 dark:border-slate/60 bg-white dark:bg-navy/60 p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-lightest-slate">{job.role}</h4>
                  <p className="text-gray-700 dark:text-light-slate">{job.company}</p>
                </div>
                <p className="text-xs font-mono text-gray-500 dark:text-slate">{job.period}</p>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-light-slate list-disc pl-5">
                {job.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-xl border border-gray-200 dark:border-slate/60 bg-white dark:bg-navy/60 p-5 space-y-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-lightest-slate">Education</h3>
          <div className="space-y-3 text-sm text-gray-700 dark:text-light-slate">
            <p>
              <span className="font-semibold">Ph.D. - Bioengineering & Robotics</span><br />
              Istituto Italiano di Tecnologia (2019)
            </p>
            <p>
              <span className="font-semibold">M.S. (Research) - Computer Science</span><br />
              IIT Kharagpur (2014)
            </p>
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 dark:border-slate/60 bg-white dark:bg-navy/60 p-5 space-y-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-lightest-slate">Technical Skills</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-light-slate list-disc pl-5">
            {skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-700 dark:text-light-slate">
            Award: Christian Benoit Award (Interspeech 2019)
          </p>
        </article>
      </section>
    </div>
  );
};
