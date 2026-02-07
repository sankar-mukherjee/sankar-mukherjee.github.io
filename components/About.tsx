import React from 'react';
import { SubstackNews } from './SubstackNews';

const skills = [
  { label: 'Pytorch', icon: 'fa-solid fa-brain' },
  { label: 'AWS', icon: 'fa-brands fa-aws' },
  { label: 'Docker', icon: 'fa-brands fa-docker' },
  { label: 'CI/CD', icon: 'fa-solid fa-gears' },
  { label: 'Vibe Coding (Cursor / Codex / Claude / OpenCode)', icon: null },
];

export const About: React.FC = () => {
  return (
    <div className="fade-in space-y-16">
      <section id="about" className="flex flex-col md:flex-row items-start gap-8">
        <div className="md:w-2/3 space-y-4 text-gray-700 dark:text-light-slate">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-lightest-slate mb-4 font-sans">
            About Me
          </h2>
          <p>
            Hello! I'm Sankar. Experienced Speech & ML Engineer specializing in end-to-end speech systems including ASR, TTS, and voice cloning. Proven track record in building and deploying foundation models, low-latency pipelines, and efficient inference on edge/cloud. Strong expertise in LLMs, diffusion, MLOps, and speech model optimization.
          </p>
          <p>
            My main focus these days is building accessible, inclusive products and digital experiences for a variety of clients. I'm always eager to learn new technologies and improve my craft.
          </p>
          <p>
            Here are a few technologies I've been working with recently:
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 font-mono text-sm">
            {skills.map(skill => (
              <li key={skill.label} className="flex items-center gap-2">
                {skill.icon ? (
                  <i className={`${skill.icon} text-gray-600 dark:text-slate`}></i>
                ) : (
                  <span className="text-black dark:text-white">▹</span>
                )}
                <span>{skill.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:w-1/3 mx-auto mt-8 md:mt-0">
            <div className="relative group w-64 h-64 mx-auto">
                <div className="absolute inset-0 bg-black dark:bg-white rounded-md transform group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-300"></div>
                <img 
                    src="/img/avatar.jpg" 
                    alt="Sankar Mukherjee"
                    className="absolute inset-0 w-full h-full object-cover rounded-md z-10"
                />
            </div>
        </div>
      </section>
      <SubstackNews />
    </div>
  );
};
