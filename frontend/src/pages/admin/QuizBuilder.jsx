import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Save } from 'lucide-react';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { api } from '../../api';

export default function QuizBuilder() {
  const navigate = useNavigate();
  const { id: courseId, qid: quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [rewardsModal, setRewardsModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [rewards, setRewards] = useState({
    first: 10, second: 7, third: 4, fourth: 2
  });

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await api.get(`/quizzes/${quizId}`);
        setQuiz(data);
        if (data.rewards) {
          setRewards(data.rewards);
        }
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const activeQuestion = quiz?.questions?.[activeQuestionIdx] || null;

  const handleAddQuestion = async () => {
    try {
      const question = await api.post(`/quizzes/${quizId}/questions`, {
        text: 'New Question',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        answer: 0,
      });
      setQuiz({ ...quiz, questions: [...(quiz.questions || []), question] });
      setActiveQuestionIdx((quiz.questions || []).length);
    } catch (err) {
      console.error('Failed to add question:', err);
    }
  };

  const handleUpdateQuestion = async (questionId, updates) => {
    try {
      const updated = await api.put(`/quizzes/questions/${questionId}`, updates);
      setQuiz({
        ...quiz,
        questions: quiz.questions.map(q => q.id === questionId ? { ...q, ...updated } : q),
      });
    } catch (err) {
      console.error('Failed to update question:', err);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/quizzes/questions/${questionId}`);
      const newQuestions = quiz.questions.filter(q => q.id !== questionId);
      setQuiz({ ...quiz, questions: newQuestions });
      if (activeQuestionIdx >= newQuestions.length) {
        setActiveQuestionIdx(Math.max(0, newQuestions.length - 1));
      }
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  const handleSaveQuiz = async () => {
    try {
      setSaving(true);
      await api.put(`/quizzes/${quizId}`, { title: quiz.title, rewards });
    } catch (err) {
      console.error('Failed to save quiz:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateOptionText = (optIdx, value) => {
    if (!activeQuestion) return;
    const newOptions = [...activeQuestion.options];
    newOptions[optIdx] = value;
    handleUpdateQuestion(activeQuestion.id, { text: activeQuestion.text, options: newOptions, answer: activeQuestion.answer });
  };

  const setCorrectAnswer = (optIdx) => {
    if (!activeQuestion) return;
    handleUpdateQuestion(activeQuestion.id, { text: activeQuestion.text, options: activeQuestion.options, answer: optIdx });
  };

  const addOption = () => {
    if (!activeQuestion) return;
    const newOptions = [...activeQuestion.options, `Option ${activeQuestion.options.length + 1}`];
    handleUpdateQuestion(activeQuestion.id, { text: activeQuestion.text, options: newOptions, answer: activeQuestion.answer });
  };

  const removeOption = (optIdx) => {
    if (!activeQuestion || activeQuestion.options.length <= 2) return;
    const newOptions = activeQuestion.options.filter((_, i) => i !== optIdx);
    const newAnswer = activeQuestion.answer >= newOptions.length ? 0 : activeQuestion.answer;
    handleUpdateQuestion(activeQuestion.id, { text: activeQuestion.text, options: newOptions, answer: newAnswer });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F5F0EB]">
        <div className="w-8 h-8 border-2 border-[#FB460D] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F5F0EB]">
        <p className="text-[#8A817C] text-[13px]">Quiz not found.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-72px)] w-full bg-[#F5F0EB]">
      {/* Sidebar Panel */}
      <div className="w-[280px] flex-shrink-0 bg-[#141314] border-r border-[#EAE4DD] flex flex-col justify-between py-6">
        <div>
          <button onClick={() => navigate(`/admin/courses/${courseId}/edit`)} className="text-[#8A817C] hover:text-[#FB460D] interactive flex items-center space-x-2 px-8 mb-8">
            <ArrowLeft size={16} />
            <span className="text-[10px] uppercase tracking-widest font-bold">BACK TO COURSE</span>
          </button>
          
          {/* Quiz Title */}
          <div className="px-8 mb-6">
            <input
              type="text"
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
              className="w-full bg-transparent text-white text-[14px] font-bold border-b border-white/20 pb-2 outline-none focus:border-[#FB460D] transition-colors"
              placeholder="Quiz Title"
            />
          </div>

          <div className="px-8 mb-4">
            <h3 className="text-[10px] text-[#8A817C] uppercase tracking-widest font-bold">QUESTIONS</h3>
          </div>
          
          <div className="flex flex-col max-h-[400px] overflow-y-auto">
            {(quiz.questions || []).map((q, idx) => (
              <button 
                key={q.id}
                onClick={() => setActiveQuestionIdx(idx)}
                className={`py-4 px-8 text-left text-[11px] tracking-widest font-bold uppercase transition-colors relative border-l-4 flex items-center justify-between group ${activeQuestionIdx === idx ? 'border-[#FB460D] bg-white/5 text-[#FB460D]' : 'border-transparent text-[#8A817C] hover:bg-white/5 hover:text-white'}`}
              >
                <span>QUESTION {(idx + 1).toString().padStart(2, '0')}</span>
                <Trash2 
                  size={14} 
                  className="opacity-0 group-hover:opacity-100 text-[#8A817C] hover:text-red-500 transition-all cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
                />
              </button>
            ))}
          </div>
          
          <div className="px-8 mt-6">
            <button onClick={handleAddQuestion} className="text-[10px] text-[#FB460D] uppercase font-bold tracking-widest interactive hover:text-white flex items-center space-x-2">
              <Plus size={14} />
              <span>ADD QUESTION</span>
            </button>
          </div>
        </div>

        <div className="px-8 pt-8 border-t border-white/10 space-y-3">
          <Button variant="ghost" className="w-full !px-0 !text-white hover:!text-[#FB460D]" onClick={() => setRewardsModal(true)}>
            REWARDS CONFIG
          </Button>
          <Button className="w-full" onClick={handleSaveQuiz} disabled={saving}>
            {saving ? '...' : <><Save size={14} className="mr-2" /> SAVE QUIZ</>}
          </Button>
        </div>
      </div>

      {/* Editor Panel */}
      <div className="flex-1 flex flex-col overflow-y-auto p-12">
        {activeQuestion ? (
          <div className="max-w-3xl w-full">
            <div className="mb-12">
              <textarea 
                className="w-full bg-transparent border-0 border-b border-[#EAE4DD] text-[#141314] text-[24px] font-bold py-4 outline-none resize-none focus:border-[#FB460D] transition-colors h-32"
                placeholder="Type your question here..."
                value={activeQuestion.text}
                onChange={(e) => {
                  // Update locally first for responsiveness
                  const newQ = { ...activeQuestion, text: e.target.value };
                  setQuiz({ ...quiz, questions: quiz.questions.map(q => q.id === activeQuestion.id ? newQ : q) });
                }}
                onBlur={() => {
                  handleUpdateQuestion(activeQuestion.id, { text: activeQuestion.text, options: activeQuestion.options, answer: activeQuestion.answer });
                }}
              />
            </div>

            <div className="space-y-3 mb-8">
              <p className="text-[10px] uppercase tracking-widest text-[#8A817C] font-bold mb-4">OPTIONS — Click left side to mark as correct answer</p>
              {activeQuestion.options.map((opt, i) => {
                const isCorrect = activeQuestion.answer === i;
                return (
                  <div key={i} className={`flex items-stretch group border transition-all ${isCorrect ? 'border-green-500 bg-green-50' : 'border-[#EAE4DD] bg-white hover:border-[#8A817C]'}`}>
                    {/* Correct answer toggle — left side */}
                    <button
                      type="button"
                      title="Mark as correct answer"
                      className={`w-20 flex flex-col items-center justify-center border-r gap-1 transition-all cursor-pointer ${isCorrect ? 'border-green-500 bg-green-500' : 'border-[#EAE4DD] hover:bg-[#F5F0EB]'}`}
                      onClick={() => setCorrectAnswer(i)}
                    >
                      {isCorrect ? (
                        <>
                          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          </div>
                          <span className="text-[8px] font-black text-white uppercase tracking-widest leading-tight">CORRECT</span>
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 rounded-full border-2 border-[#8A817C]/30"></div>
                          <span className="text-[7px] font-bold text-[#8A817C]/60 uppercase tracking-widest leading-tight text-center">SET<br/>CORRECT</span>
                        </>
                      )}
                    </button>

                    {/* Option label */}
                    <div className={`w-8 flex items-center justify-center border-r ${isCorrect ? 'border-green-500' : 'border-[#EAE4DD]'}`}>
                      <span className={`text-[11px] font-bold ${isCorrect ? 'text-green-500' : 'text-[#8A817C]'}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                    </div>

                    {/* Option text input */}
                    <input
                      type="text"
                      className={`flex-1 bg-transparent border-none px-4 py-5 outline-none text-[14px] ${isCorrect ? 'text-green-800 font-semibold' : 'text-[#141314]'}`}
                      value={opt}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      onChange={(e) => {
                        const newOptions = [...activeQuestion.options];
                        newOptions[i] = e.target.value;
                        const newQ = { ...activeQuestion, options: newOptions };
                        setQuiz(prev => ({ ...prev, questions: prev.questions.map(q => q.id === activeQuestion.id ? newQ : q) }));
                      }}
                      onBlur={() => updateOptionText(i, activeQuestion.options[i])}
                    />

                    {/* Delete option */}
                    <button
                      type="button"
                      className={`w-12 flex items-center justify-center transition-colors border-l ${isCorrect ? 'border-green-500 text-green-300 hover:text-red-500' : 'border-[#EAE4DD] text-[#EAE4DD] hover:text-red-500'}`}
                      onClick={() => removeOption(i)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            <button onClick={addOption} className="text-[11px] text-[#FB460D] uppercase font-bold tracking-widest interactive hover:text-[#141314] flex items-center space-x-2">
              <Plus size={14} />
              <span>ADD OPTION</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[#8A817C] text-[14px] mb-4">No questions yet.</p>
              <Button onClick={handleAddQuestion}>+ ADD FIRST QUESTION</Button>
            </div>
          </div>
        )}
      </div>

      {/* Rewards Modal */}
      <Modal isOpen={rewardsModal} onClose={() => setRewardsModal(false)}>
        <h2 className="text-[28px] font-bold text-[#141314] uppercase mb-8 leading-tight">
          POINT REWARDS
        </h2>
        <div className="space-y-4 mb-10">
          {[
            { key: 'first', label: '1ST ATTEMPT' },
            { key: 'second', label: '2ND ATTEMPT' },
            { key: 'third', label: '3RD ATTEMPT' },
            { key: 'fourth', label: '4TH+ ATTEMPT' },
          ].map(row => (
            <div key={row.key} className="flex items-center justify-between border-b border-[#EAE4DD] py-4">
              <span className="text-[11px] font-bold text-[#8A817C] tracking-widest uppercase">{row.label}</span>
              <div className="w-24">
                <input 
                  type="number" 
                  value={rewards[row.key]}
                  onChange={(e) => setRewards({ ...rewards, [row.key]: parseInt(e.target.value) || 0 })}
                  className="w-full bg-transparent border-0 text-right text-[#141314] text-xl font-bold outline-none font-mono"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={() => { setRewardsModal(false); handleSaveQuiz(); }}>SAVE CONFIG</Button>
        </div>
      </Modal>
    </div>
  );
}
