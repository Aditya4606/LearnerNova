import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { CheckCircle2, ChevronRight, AlertCircle, Trophy, RefreshCw } from 'lucide-react';
import { api } from '../../api';
import Button from '../../components/Button';

export default function QuizPlayer() {
  const { id: courseId, qid: quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Quiz State
  const [currentIdx, setCurrentIdx] = useState(-1); // -1 is Intro screen
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/quizzes/${quizId}`);
        setQuiz(data);
      } catch (err) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current.children, 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [currentIdx, isFinished]);

  const handleStart = () => {
    setCurrentIdx(0);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    
    const question = quiz.questions[currentIdx];
    const isCorrect = selectedOption === question.answer;
    
    const newAnswers = [...answers, { questionId: question.id, selected: selectedOption, isCorrect }];
    setAnswers(newAnswers);
    
    if (isCorrect) setScore(score + 1);
    
    setSelectedOption(null);
    setShowFeedback(false);

    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentIdx(-1);
    setScore(0);
    setAnswers([]);
    setSelectedOption(null);
    setIsFinished(false);
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-[#F5F0EB]">
      <div className="w-8 h-8 border-2 border-[#EAE4DD] border-t-[#FB460D] animate-spin"></div>
    </div>
  );

  if (error || !quiz) return (
    <div className="flex-1 flex items-center justify-center p-12 bg-[#F5F0EB]">
      <div className="max-w-md w-full text-center border border-[#EAE4DD] bg-white p-12">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-6" />
        <h2 className="text-xl font-bold mb-4 text-[#141314]">QUIZ UNAVAILABLE</h2>
        <p className="text-[#8A817C] text-[14px] mb-8">{error || 'This assessment could not be retrieved.'}</p>
        <Button onClick={() => navigate(`/courses/${courseId}`)}>RETURN TO COURSE</Button>
      </div>
    </div>
  );

  const questions = quiz.questions || [];

  // Intro Screen
  if (currentIdx === -1) {
    return (
      <div className="flex-1 flex flex-col bg-[#F5F0EB]" ref={contentRef}>
         {/* Top Bar Navigation */}
         <div className="h-[72px] bg-[#FFFFFF] border-b border-[#EAE4DD] px-8 flex items-center">
            <button 
              className="text-[10px] font-bold text-[#8A817C] hover:text-[#FB460D] uppercase tracking-widest flex items-center transition-colors"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              ← BACK TO COURSE
            </button>
         </div>

         <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
            <div className="mb-6">
              <span className="border border-[#FB460D]/40 text-[#FB460D] text-[10px] uppercase font-bold tracking-[0.2em] px-4 py-1.5 rounded-full bg-[#FB460D]/5">ASSESSMENT</span>
            </div>
            <h1 className="text-[48px] font-bold text-[#141314] leading-tight mb-6 tracking-tight">
              {quiz.title}
            </h1>
            <p className="text-[#8A817C] text-[16px] mb-12 leading-relaxed">
              Test your mastery of this module. This assessment consists of {questions.length} questions. High performance unlocks advanced learning achievements.
            </p>
            
            <div className="grid grid-cols-2 gap-8 w-full mb-16 border-y border-[#EAE4DD] py-8">
              <div className="text-center border-r border-[#EAE4DD]">
                <p className="text-[10px] uppercase font-black text-[#8A817C] tracking-widest mb-1">QUESTIONS</p>
                <p className="text-[24px] font-bold text-[#141314]">{questions.length.toString().padStart(2, '0')}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase font-black text-[#8A817C] tracking-widest mb-1">REQ. SCORE</p>
                <p className="text-[24px] font-bold text-[#141314]">80%</p>
              </div>
            </div>

            <Button onClick={handleStart} className="!px-16 !py-5 text-[14px] tracking-[0.1em]">
              START ASSESSMENT →
            </Button>
         </div>
      </div>
    );
  }

  // Result Screen
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 80;

    return (
      <div className="flex-1 flex flex-col bg-[#F5F0EB]" ref={contentRef}>
         <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 border-2 ${passed ? 'border-green-500 bg-green-50 text-green-500' : 'border-[#FB460D] bg-[#FB460D]/5 text-[#FB460D]'}`}>
              {passed ? <Trophy size={48} /> : <AlertCircle size={48} />}
            </div>
            
            <h2 className="text-[40px] font-bold text-[#141314] mb-2 leading-none uppercase tracking-tighter">
              {passed ? "Assessment Passed" : "Keep Training"}
            </h2>
            <p className="text-[#8A817C] text-[11px] uppercase tracking-[0.2em] font-bold mb-12">
              RESULT SCORE: {percentage}% ({score}/{questions.length})
            </p>

            <div className="w-full bg-white border border-[#EAE4DD] p-8 mb-12 text-left">
              <h4 className="text-[10px] font-black uppercase text-[#8A817C] tracking-widest mb-6 border-b border-[#EAE4DD] pb-4">UNLOCKED REWARDS</h4>
              {passed ? (
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-500 text-white rounded flex items-center justify-center font-bold text-[18px]">★</div>
                  <div>
                     <p className="text-[14px] font-bold text-[#141314]">Course Excellence Badge</p>
                     <p className="text-[11px] text-[#8A817C]">Attribute added to your profile intelligence.</p>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-[#8A817C] italic">Achieve 80% or higher to unlock module specific rewards.</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button className="flex-1" onClick={() => navigate(`/courses/${courseId}`)}>
                CONTINUE COURSE
              </Button>
              <Button variant="ghost" className="flex-1" onClick={restartQuiz}>
                <RefreshCw size={14} className="mr-2" /> RETAKE ASSESSMENT
              </Button>
            </div>
         </div>
      </div>
    );
  }

  // Active Question Screen
  const question = questions[currentIdx];
  const progressPercent = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="flex-1 flex flex-col bg-[#F5F0EB]">
      {/* Progress Header */}
      <div className="bg-[#FFFFFF] border-b border-[#EAE4DD]">
        <div className="h-[72px] px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <span className="text-[10px] font-bold text-[#8A817C] uppercase tracking-[0.2em]">TESTING PHASE</span>
             <span className="text-[12px] font-bold text-[#141314]">QUESTION {(currentIdx + 1).toString().padStart(2, '0')}/{questions.length.toString().padStart(2, '0')}</span>
          </div>
          <div className="w-48 h-1 bg-[#F5F0EB]">
            <div 
              className="h-full bg-[#FB460D] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 lg:p-24 flex flex-col items-center">
        <div className="max-w-3xl w-full" ref={contentRef}>
          <h3 className="text-[28px] font-bold text-[#141314] leading-tight mb-12 tracking-tight">
            {question.text}
          </h3>

          <div className="space-y-4">
            {(question.options || []).map((opt, i) => {
              const char = String.fromCharCode(65 + i);
              const isSelected = selectedOption === i;
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedOption(i)}
                  className={`w-full text-left flex items-stretch border transition-all duration-200 group ${
                    isSelected 
                    ? 'border-[#FB460D] bg-white ring-1 ring-[#FB460D]' 
                    : 'border-[#EAE4DD] bg-white hover:border-[#FB460D]/40'
                  }`}
                >
                  <div className={`w-14 flex items-center justify-center border-r transition-colors ${isSelected ? 'bg-[#FB460D] border-[#FB460D] text-white' : 'bg-[#F5F0EB]/50 border-[#EAE4DD] text-[#8A817C]'}`}>
                    <span className="text-[13px] font-bold font-mono">{char}</span>
                  </div>
                  <div className="flex-1 p-6">
                    <p className={`text-[15px] font-bold ${isSelected ? 'text-[#141314]' : 'text-[#8A817C] group-hover:text-[#141314]'}`}>
                      {opt}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="px-6 flex items-center text-[#FB460D]">
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-16 flex justify-between items-center border-t border-[#EAE4DD] pt-12">
             <div className="flex items-center text-[10px] font-bold text-[#8A817C] uppercase tracking-widest">
                <AlertCircle size={14} className="mr-2" /> Select the most architecturally sound answer
             </div>
             <Button 
               disabled={selectedOption === null}
               onClick={handleNext}
               className="!px-12"
             >
               NEXT QUESTION <ChevronRight size={14} className="ml-2" />
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
