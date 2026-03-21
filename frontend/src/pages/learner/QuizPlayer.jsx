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
  const [attemptsInfo, setAttemptsInfo] = useState({ attempts: [], bestScore: 0, maxAttempts: 4 });
  
  // Quiz State
  const [currentIdx, setCurrentIdx] = useState(-1); // -1 is Intro screen
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  
  const contentRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizData, attemptsData] = await Promise.all([
        api.get(`/quizzes/${quizId}`),
        api.get(`/quizzes/${quizId}/attempts`)
      ]);
      setQuiz(quizData);
      setAttemptsInfo(attemptsData);
    } catch (err) {
      setError(err.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
    if (attemptsInfo.attempts.length >= attemptsInfo.maxAttempts) {
      alert("Maximum attempts reached for this assessment.");
      return;
    }
    setCurrentIdx(0);
  };

  const handleNext = async () => {
    if (selectedOption === null) return;
    
    const question = quiz.questions[currentIdx];
    const newAnswers = [...answers, { questionId: question.id, selectedOption }];
    setAnswers(newAnswers);
    
    setSelectedOption(null);

    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Last question - Submit!
      try {
        setIsSubmitting(true);
        const result = await api.post(`/quizzes/${quizId}/submit`, { answers: newAnswers });
        setLastResult(result);
        setIsFinished(true);
        // Refresh attempts info
        const updatedAttempts = await api.get(`/quizzes/${quizId}/attempts`);
        setAttemptsInfo(updatedAttempts);
      } catch (err) {
        setError(err.message || 'Failed to submit quiz');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const restartQuiz = () => {
    if (attemptsInfo.attempts.length >= attemptsInfo.maxAttempts) return;
    setCurrentIdx(-1);
    setAnswers([]);
    setSelectedOption(null);
    setIsFinished(false);
    setLastResult(null);
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
  const currentAttempts = attemptsInfo.attempts.length;
  const maxAttempts = attemptsInfo.maxAttempts;

  // Intro Screen
  if (currentIdx === -1) {
    return (
      <div className="flex-1 flex flex-col bg-[#F5F0EB]" ref={contentRef}>
         {/* Top Bar Navigation */}
         <div className="h-[72px] bg-[#FFFFFF] border-b border-[#EAE4DD] px-8 flex items-center justify-between">
            <button 
              className="text-[10px] font-bold text-[#8A817C] hover:text-[#FB460D] uppercase tracking-widest flex items-center transition-colors"
              onClick={() => navigate(`/courses/${courseId}`)}
            >
              ← BACK TO COURSE
            </button>
            <div className="flex items-center space-x-6">
               <div className="text-right">
                  <p className="text-[9px] uppercase font-black text-[#8A817C] tracking-widest">ATTEMPTS USED</p>
                  <p className="text-[14px] font-bold text-[#141314]">{currentAttempts}/{maxAttempts}</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] uppercase font-black text-[#8A817C] tracking-widest">BEST SCORE</p>
                  <p className="text-[14px] font-bold text-[#FB460D]">{Math.round((attemptsInfo.bestScore / questions.length) * 100)}%</p>
               </div>
            </div>
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

            {/* Previous Attempts Scoreboard */}
            {attemptsInfo.attempts.length > 0 && (
              <div className="w-full bg-white border border-[#EAE4DD] p-6 mb-12">
                <h4 className="text-[10px] font-black uppercase text-[#8A817C] tracking-widest mb-4">PREVIOUS ATTEMPTS</h4>
                <div className="space-y-2">
                  {[...attemptsInfo.attempts].reverse().map((a) => {
                    const pct = Math.round((a.score / a.total) * 100);
                    const isBest = a.score === attemptsInfo.bestScore;
                    return (
                      <div key={a.id} className={`flex items-center justify-between p-3 border ${isBest ? 'border-[#FB460D] bg-[#FB460D]/5' : 'border-[#EAE4DD]'}`}>
                        <div className="flex items-center space-x-3">
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${isBest ? 'text-[#FB460D]' : 'text-[#8A817C]'}`}>Round {a.attemptNo}</span>
                          {isBest && <span className="text-[9px] font-black text-[#FB460D] bg-[#FB460D]/10 px-2 py-0.5 uppercase tracking-widest">BEST</span>}
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-[12px] text-[#8A817C]">{a.score}/{a.total}</span>
                          <span className={`text-[14px] font-bold ${isBest ? 'text-[#FB460D]' : 'text-[#141314]'}`}>{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentAttempts < maxAttempts ? (
              <Button onClick={handleStart} className="!px-16 !py-5 text-[14px] tracking-[0.1em]">
                {currentAttempts > 0 ? 'RETAKE ASSESSMENT →' : 'START ASSESSMENT →'}
              </Button>
            ) : (
              <div className="bg-white border border-[#EAE4DD] p-6 text-center max-w-sm">
                <p className="text-[#FB460D] font-bold text-[14px] mb-2 uppercase tracking-wider">Maximum Attempts Reached</p>
                <p className="text-[#8A817C] text-[12px]">Your best score of {Math.round((attemptsInfo.bestScore / questions.length) * 100)}% has been recorded.</p>
              </div>
            )}
         </div>
      </div>
    );
  }

  // Result Screen
  if (isFinished && lastResult) {
    const percentage = Math.round((lastResult.score / lastResult.total) * 100);
    const passed = percentage >= 80;
    const remaining = lastResult.remainingAttempts;

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
              RESULT SCORE: {percentage}% ({lastResult.score}/{lastResult.total})
            </p>

            <div className="w-full bg-white border border-[#EAE4DD] p-8 mb-12 text-left">
              <div className="grid grid-cols-2 gap-8">
                 <div>
                    <h4 className="text-[10px] font-black uppercase text-[#8A817C] tracking-widest mb-4">UNLOCKED REWARDS</h4>
                    {passed ? (
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-500 text-white rounded flex items-center justify-center font-bold text-[18px]">★</div>
                        <div>
                           <p className="text-[13px] font-bold text-[#141314]">Module Mastery</p>
                           <p className="text-[10px] text-[#8A817C]">Badge verified.</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[12px] text-[#8A817C] italic">Achieve 80% to unlock rewards.</p>
                    )}
                 </div>
                 <div className="border-l border-[#EAE4DD] pl-8">
                    <h4 className="text-[10px] font-black uppercase text-[#8A817C] tracking-widest mb-4">ATTEMPT STATUS</h4>
                    <p className="text-[13px] font-bold text-[#141314]">Attempt {lastResult.attemptNo} of 4</p>
                    <p className="text-[11px] text-[#8A817C] mt-1">
                      {remaining > 0 ? `${remaining} attempt${remaining > 1 ? 's' : ''} remaining.` : 'Final attempt completed.'}
                    </p>
                 </div>
              </div>
            </div>

            {/* All Attempts Scoreboard */}
            {attemptsInfo.attempts.length > 0 && (
              <div className="w-full bg-white border border-[#EAE4DD] p-6 mb-12">
                <h4 className="text-[10px] font-black uppercase text-[#8A817C] tracking-widest mb-4">ALL ATTEMPTS</h4>
                <div className="space-y-2">
                  {[...attemptsInfo.attempts].reverse().map((a) => {
                    const pct = Math.round((a.score / a.total) * 100);
                    const isBest = a.score === attemptsInfo.bestScore;
                    return (
                      <div key={a.id} className={`flex items-center justify-between p-3 border ${isBest ? 'border-[#FB460D] bg-[#FB460D]/5' : 'border-[#EAE4DD]'}`}>
                        <div className="flex items-center space-x-3">
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${isBest ? 'text-[#FB460D]' : 'text-[#8A817C]'}`}>Round {a.attemptNo}</span>
                          {isBest && <span className="text-[9px] font-black text-[#FB460D] bg-[#FB460D]/10 px-2 py-0.5 uppercase tracking-widest">BEST</span>}
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-[12px] text-[#8A817C]">{a.score}/{a.total}</span>
                          <span className={`text-[14px] font-bold ${isBest ? 'text-[#FB460D]' : 'text-[#141314]'}`}>{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button className="flex-1" onClick={() => navigate(`/courses/${courseId}`)}>
                CONTINUE COURSE
              </Button>
              {remaining > 0 && (
                <Button variant="outline" className="flex-1" onClick={restartQuiz}>
                   <RefreshCw size={14} className="mr-2" /> RETAKE ASSESSMENT
                </Button>
              )}
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
                  disabled={isSubmitting}
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
               disabled={selectedOption === null || isSubmitting}
               onClick={handleNext}
               className="!px-12"
             >
               {currentIdx < questions.length - 1 ? (
                 <>NEXT QUESTION <ChevronRight size={14} className="ml-2" /></>
               ) : (
                 <>{isSubmitting ? 'SUBMITTING...' : 'FINISH ASSESSMENT'}</>
               )}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
