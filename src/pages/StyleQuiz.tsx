import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, RefreshCw, ArrowLeft, Eye } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { products } from '../data/products';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

type Answers = Record<string, string>;

function getRecommendations(answers: Answers): Product[] {
  let list = [...products];

  // Filter by silhouette preference
  if (answers.silhouette) {
    const sil = answers.silhouette.toLowerCase();
    if (sil.includes('ballgown') || sil.includes('مهيب')) {
      list = list.filter(p => p.silhouette?.toLowerCase().includes('ballgown') || p.style.some(s => s.toLowerCase().includes('ball gown')));
    } else if (sil.includes('mermaid') || sil.includes('حورية')) {
      list = list.filter(p => p.silhouette?.toLowerCase().includes('mermaid') || p.style.some(s => s.toLowerCase().includes('mermaid')));
    } else if (sil.includes('a-line') || sil.includes('أثري')) {
      list = list.filter(p => p.silhouette?.toLowerCase().includes('a-line') || p.style.some(s => s.toLowerCase().includes('a-line')));
    } else if (sil.includes('slip') || sil.includes('عصري')) {
      list = list.filter(p => p.style.some(s => s.toLowerCase().includes('modern') || s.toLowerCase().includes('minimalist')));
    }
  }

  // Filter by fabric preference
  if (answers.fabric) {
    const fab = answers.fabric.toLowerCase();
    if (fab.includes('lace') || fab.includes('دانتيل')) {
      list = list.filter(p => p.fabric?.toLowerCase().includes('lace'));
    } else if (fab.includes('silk') || fab.includes('ميكادو')) {
      list = list.filter(p => p.fabric?.toLowerCase().includes('silk') || p.fabric?.toLowerCase().includes('mikado'));
    } else if (fab.includes('chiffon') || fab.includes('تويل')) {
      list = list.filter(p => p.fabric?.toLowerCase().includes('chiffon') || p.fabric?.toLowerCase().includes('tulle'));
    } else if (fab.includes('satin') || fab.includes('ساتان')) {
      list = list.filter(p => p.fabric?.toLowerCase().includes('satin'));
    }
  }

  // Filter by mood/style preference
  if (answers.mood) {
    const mood = answers.mood.toLowerCase();
    if (mood.includes('heritage') || mood.includes('تراث')) {
      list = list.filter(p => p.style.some(s => s.toLowerCase().includes('classic') || s.toLowerCase().includes('royal')));
    } else if (mood.includes('avant-garde') || mood.includes('طليع')) {
      list = list.filter(p => p.style.some(s => s.toLowerCase().includes('modern') || s.toLowerCase().includes('bold')));
    } else if (mood.includes('romantic') || mood.includes('رومانسية')) {
      list = list.filter(p => p.style.some(s => s.toLowerCase().includes('romantic') || s.toLowerCase().includes('ethereal')));
    } else if (mood.includes('minimalism') || mood.includes('بساطة')) {
      list = list.filter(p => p.style.some(s => s.toLowerCase().includes('minimalist') || s.toLowerCase().includes('simple')));
    }
  }

  // Filter by venue (bridal vs evening)
  if (answers.venue) {
    const venue = answers.venue.toLowerCase();
    if (venue.includes('ballroom') || venue.includes('قاعة') || venue.includes('villa') || venue.includes('فيلا')) {
      list = list.filter(p => p.category === 'Bridal Gown');
    } else if (venue.includes('desert') || venue.includes('صحراوية') || venue.includes('terrace') || venue.includes('تراس')) {
      list = list.filter(p => p.category === 'Evening Dress' || p.category === 'Bridal Gown');
    }
  }

  // Fallback: if no results, return featured items
  if (list.length === 0) {
    list = products.filter(p => p.isFeatured).slice(0, 4);
  }

  return list.slice(0, 4);
}

export default function StyleQuiz() {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [finished, setFinished] = useState(false);

  const questions = [
    {
      id: 'venue',
      question: t('quiz.q1'),
      options: [t('quiz.q1_opt1'), t('quiz.q1_opt2'), t('quiz.q1_opt3'), t('quiz.q1_opt4')]
    },
    {
      id: 'silhouette',
      question: t('quiz.q2'),
      options: [t('quiz.q2_opt1'), t('quiz.q2_opt2'), t('quiz.q2_opt3'), t('quiz.q2_opt4')]
    },
    {
      id: 'fabric',
      question: t('quiz.q3'),
      options: [t('quiz.q3_opt1'), t('quiz.q3_opt2'), t('quiz.q3_opt3'), t('quiz.q3_opt4')]
    },
    {
      id: 'mood',
      question: t('quiz.q4'),
      options: [t('quiz.q4_opt1'), t('quiz.q4_opt2'), t('quiz.q4_opt3'), t('quiz.q4_opt4')]
    }
  ];

  const progress = ((step) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[step];
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setFinished(true);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({});
    setFinished(false);
  };

  const recommendations = finished ? getRecommendations(answers) : [];

  return (
    <div className="pt-32 pb-20 min-h-screen bg-ivory flex flex-col items-center px-6">
      <div className="max-w-2xl w-full">
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-4xl md:text-5xl text-stone-800 tracking-widest uppercase mb-4">{t('quiz.title')}</h1>
            <p className="font-body text-stone-500 text-[10px] tracking-[0.4em] uppercase">{t('quiz.subtitle')}</p>
            <div className="w-16 h-px bg-gold mx-auto mt-6" />
          </motion.div>
        </header>

        {/* Progress Bar */}
        {!finished && (
          <div className="h-1 bg-stone-100 mb-8">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              className="h-full bg-gold"
            />
          </div>
        )}

        <div className="bg-ivory p-8 md:p-12 relative min-h-[400px] flex flex-col items-center justify-center border border-stone-100">
          <AnimatePresence mode="wait">
            {!finished ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                <div className="mb-8 flex items-center justify-between">
                   <span className="text-[10px] tracking-widest text-gold font-bold uppercase">{t('quiz.progress')} {step + 1} / {questions.length}</span>
                   {step > 0 && (
                     <button 
                       onClick={() => setStep(step - 1)}
                       className="text-stone-400 hover:text-stone-800 transition-colors"
                     >
                       <ArrowLeft className="w-4 h-4" />
                     </button>
                   )}
                </div>
                
                <h3 className="font-heading text-2xl md:text-3xl text-stone-800 mb-10 tracking-wide">
                  {questions[step].question}
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {questions[step].options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className="group flex items-center justify-between p-6 border border-stone-100 bg-stone-50/50 hover:bg-ivory hover:border-gold hover:shadow-xl hover:shadow-gold/5 transition-all duration-300 text-left"
                    >
                      <span className="font-body text-sm text-stone-700 group-hover:text-stone-900 group-hover:pl-2 transition-all duration-300">{option}</span>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-gold transition-colors" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
              >
                <div className="text-center mb-12">
                  <span className="text-[10px] tracking-[0.5em] uppercase text-gold font-bold">{t('quiz.your_aesthetic')}</span>
                  <h2 className="font-heading text-3xl md:text-4xl text-stone-800 mt-3 mb-4">
                    {recommendations.length > 0 ? t('quiz.your_matches') : t('quiz.no_matches')}
                  </h2>
                  <div className="w-16 h-px bg-gold mx-auto mb-5" />
                  <p className="font-body text-sm text-stone-500">
                    {recommendations.length > 0 
                      ? t('quiz.based_on_answers')
                      : t('quiz.browse_collection')
                    }
                  </p>
                </div>

                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
                    {recommendations.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="font-body text-stone-500 italic">{t('quiz.try_different')}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/collection/all" className="btn-luxury flex items-center gap-2 justify-center">
                    <Eye className="w-4 h-4" />
                    {t('quiz.view_all')}
                  </Link>
                  <button 
                    onClick={resetQuiz}
                    className="btn-luxury-outline flex items-center gap-2 justify-center"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t('quiz.retry')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Decor */}
        <div className="mt-12 flex justify-center gap-1">
          {questions.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-0.5 transition-all duration-500", 
                i <= step ? "w-8 bg-gold" : "w-4 bg-stone-200"
              )} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
