/**
 * DANASI OPPORTUNITY HUB — Career Application Preparation Suite Modal
 * Founder: NDAYIZEYE Samuel
 */

import React, { useState } from 'react';
import { useTranslation } from '../../translations/index.tsx';
import { Job } from '../../types/index.ts';
import { FileText, Sparkles, MessageSquare, BookOpen, X, Copy, Check, CheckCircle2, ArrowRight } from 'lucide-react';

interface CareerPrepModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackApplication?: (job: Job) => void;
}

export const CareerPrepModal: React.FC<CareerPrepModalProps> = ({ job, isOpen, onClose, onTrackApplication }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'cv' | 'cover' | 'interview'>('cv');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen || !job) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const sampleCoverLetter = `Dear Hiring Committee at ${job.employerName},

I am writing to express my enthusiastic interest in the ${job.title} position based in ${job.city}, ${job.country}. With my background in ${job.requiredSkills.slice(0, 2).join(' and ')}, I have developed a disciplined track record of executing high-impact organizational objectives.

This role resonates strongly with my career trajectory because ${job.employerName} is recognized for excellence. In my previous experiences, I have applied competencies directly relevant to your requirements, including:
- Expertise in ${job.requiredSkills.join(', ')}.
- Proven execution in fulfilling core responsibilities like ${job.responsibilities[0] || 'delivering technical and operational outcomes'}.

I am committed to upholding the highest international standards of work ethic, collaborative problem-solving, and continuous learning. Thank you for your consideration.

Sincerely,
[Your Full Name]
DANASI Candidate Portfolio`;

  const sampleInterviewQuestions = [
    {
      q: `How have you previously demonstrated proficiency in ${job.requiredSkills[0] || 'core technical competencies'}?`,
      tip: 'Structure your answer using the STAR method: Situation, Task, Action, and measurable Result.'
    },
    {
      q: `Why do you wish to join ${job.employerName} specifically for this ${job.title} opening?`,
      tip: 'Mention the mission of the organization, their market impact in Rwanda or globally, and how your skills accelerate their goals.'
    },
    {
      q: `How do you organize your workflow when dealing with tight deadlines and competing deliverables?`,
      tip: 'Reference your prior experience managing milestones and maintaining documentation standards.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-blue-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-amber-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{t('jobs.careerPrep.title')}</h3>
              <p className="text-[11px] text-blue-200">
                Tailored for <span className="font-semibold text-white">{job.title}</span> at {job.employerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 shrink-0">
          <button
            onClick={() => setActiveTab('cv')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'cv'
                ? 'border-blue-700 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>ATS Resume Alignment</span>
          </button>
          <button
            onClick={() => setActiveTab('cover')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'cover'
                ? 'border-blue-700 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Targeted Cover Letter</span>
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'interview'
                ? 'border-blue-700 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Interview Preparation</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'cv' && (
            <div className="space-y-5">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-700" />
                  ATS Optimization Strategy
                </h4>
                <p className="text-xs text-blue-900/90 leading-relaxed">
                  Enterprise recruitment portals parse resumes for exact skill matches. Integrate these target keywords into your bullet points:
                </p>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Mandatory Resume Keywords:</h5>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                  <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200">
                    {job.workplaceArrangement === 'remote' ? 'Remote Collaboration' : job.city}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200">
                    {job.educationRequirement}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h5 className="text-xs font-bold text-slate-900">Recommended Headline Template</h5>
                <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-800 select-all border border-slate-200 flex justify-between items-center">
                  <span>{job.title} | Specialist in {job.requiredSkills[0] || 'Domain'} | {job.country}</span>
                  <button
                    onClick={() => handleCopy(`${job.title} | Specialist in ${job.requiredSkills[0] || 'Domain'} | ${job.country}`, 'hl')}
                    className="p-1 text-slate-500 hover:text-slate-900"
                  >
                    {copied === 'hl' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Pre-Submission Quality Checklist:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Quantify impact (e.g. "Improved workflow turnaround by 25%").</li>
                  <li>Verify contact email and international phone format (+250...).</li>
                  <li>Export exclusively in clean standard PDF format.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'cover' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">Structured Draft Statement</h4>
                <button
                  onClick={() => handleCopy(sampleCoverLetter, 'cl')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  {copied === 'cl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'cl' ? 'Copied' : 'Copy Template'}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={12}
                value={sampleCoverLetter}
                className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed focus:outline-none select-all"
              />
            </div>
          )}

          {activeTab === 'interview' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Common behavioral and competency scenarios tailored for {job.title}:
              </p>

              <div className="space-y-3">
                {sampleInterviewQuestions.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <p className="text-xs font-bold text-slate-900">Q{idx + 1}: {item.q}</p>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-semibold text-blue-700">Coaching Strategy:</span> {item.tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Powered by DANASI Career Services Engine
          </span>

          <div className="flex items-center gap-3">
            {onTrackApplication && (
              <button
                type="button"
                onClick={() => {
                  onTrackApplication(job);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                Track this Application
              </button>
            )}
            <a
              href={job.originalSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors"
            >
              <span>{t('jobs.card.applyNow')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
