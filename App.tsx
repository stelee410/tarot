import React, { useState, useEffect, useRef } from 'react';
import { ArcanaType, DrawnCard, Spread, AppState, Suit, TarotCard, ChatMessage } from './types';
import { TAROT_DECK, SPREADS } from './data';
import { analyzeIntentAndSelectSpread, getReadingStream, getFollowUpStream } from './gemini';
import { getQuantumRandomNumbers } from './quantum';
import { GenerateContentResponse } from "@google/genai";

// --- Helpers ---

const REMOTE_BASE_URL = "https://www.sacred-texts.com/tarot/pkt/img";
const LOCAL_BASE_URL = "/assets/cards";

const getCardFilename = (card: DrawnCard | TarotCard): string => {
  let prefix = '';
  let numStr = card.number.toString().padStart(2, '0');

  if (card.arcana === ArcanaType.MAJOR) {
    prefix = 'ar';
  } else {
    // Suit mapping
    switch (card.suit) {
      case Suit.WANDS: prefix = 'wa'; break;
      case Suit.CUPS: prefix = 'cu'; break;
      case Suit.SWORDS: prefix = 'sw'; break;
      case Suit.PENTACLES: prefix = 'pe'; break;
      default: return '';
    }
  }
  return `${prefix}${numStr}.jpg`;
};

const getSuitIcon = (card: DrawnCard | TarotCard) => {
    if (card.arcana === ArcanaType.MAJOR) return '★';
    switch (card.suit) {
        case Suit.WANDS: return '🪄'; 
        case Suit.CUPS: return '🏆'; 
        case Suit.SWORDS: return '⚔'; 
        case Suit.PENTACLES: return '🪙'; 
        default: return '★';
    }
};

// --- Components ---

const CardVisual = ({ card, isReversed, isRevealed, onClick, small = false, className = "" }: {
  card?: DrawnCard | TarotCard,
  isReversed?: boolean,
  isRevealed: boolean,
  onClick?: () => void,
  small?: boolean,
  className?: string
}) => {
  // Image Loading Logic:
  // 1. Try Local URL first
  // 2. On Error -> Try Remote URL
  // 3. On Error -> Show Fallback Icon
  const [imgSrc, setImgSrc] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (card) {
      const filename = getCardFilename(card);
      // Start with local
      setImgSrc(`${LOCAL_BASE_URL}/${filename}`);
      setIsError(false);
    }
  }, [card?.id]);

  const handleImgError = () => {
    if (!card) return;
    const filename = getCardFilename(card);
    
    // Check if we are currently using local, if so, switch to remote
    if (imgSrc.startsWith(LOCAL_BASE_URL)) {
        // console.log(`Local image missing for ${card.name}, falling back to remote.`);
        setImgSrc(`${REMOTE_BASE_URL}/${filename}`);
    } else {
        // Already tried remote (or other error), show fallback UI
        setIsError(true);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative preserve-3d transition-all duration-700 cursor-pointer group select-none
        ${small ? 'w-24 h-40' : 'w-48 h-80 sm:w-56 sm:h-96'}
        ${className}
      `}
    >
      {/* --- CARD BACK (The Mystery) --- */}
      <div className={`
        absolute w-full h-full rounded-lg shadow-[0_2px_15px_rgba(0,0,0,0.8)] 
        backface-hidden overflow-hidden flex flex-col items-center justify-center
        bg-[#1a1a2e] border-[1px] border-[#443355]
        ${isRevealed ? 'rotate-y-180' : ''}
      `}
      >
        {/* Mystic Texture Background */}
        <div className="absolute inset-0 opacity-40" 
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
        
        {/* Decorative Border */}
        <div className="absolute inset-2 border border-mystic-gold/20 rounded opacity-60"></div>
        <div className="absolute inset-3 border-[0.5px] border-mystic-gold/10 rounded-sm"></div>

        {/* Central Symbol: The All-Seeing Eye / Sun */}
        <div className="relative w-24 h-24 flex items-center justify-center opacity-80">
            {/* Rays */}
            <div className="absolute w-full h-full border border-mystic-gold/20 rotate-45"></div>
            <div className="absolute w-full h-full border border-mystic-gold/20"></div>
            
            {/* Inner Circle */}
            <div className="w-16 h-16 rounded-full border border-mystic-gold/40 flex items-center justify-center bg-[#0f0c29]">
                 <span className="text-2xl text-mystic-gold/80">۞</span>
            </div>
        </div>
      </div>

      {/* --- CARD FRONT (The Revelation) --- */}
      <div className={`
        absolute w-full h-full rounded-lg shadow-md
        backface-hidden bg-[#fffdf9] text-black flex flex-col overflow-hidden
        ${isRevealed ? '' : '-rotate-y-180'}
      `}
      style={{
         transform: isReversed ? 'rotate(180deg)' : 'rotate(0deg)'
      }}
      >
        {/* Subtle Paper Texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cardboard.png")' }}>
        </div>

        {card ? (
            <div className="w-full h-full relative flex flex-col p-[4px] sm:p-[6px]">
                
                {/* Image Area */}
                <div className="relative flex-1 overflow-hidden border-[0.5px] border-black/20 bg-[#f0f0f0]">
                    {!isError ? (
                        <img 
                            src={imgSrc} 
                            alt={card.englishName} 
                            className="w-full h-full object-cover"
                            onError={handleImgError}
                        />
                    ) : (
                        // Fallback Art if image fails both local and remote
                        <div className="w-full h-full flex items-center justify-center bg-[#f0f0f0]">
                            <span className="text-4xl text-gray-400 opacity-80 filter grayscale">
                                {getSuitIcon(card)}
                            </span>
                        </div>
                    )}
                    {/* Inner shadow overlay for depth */}
                    <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] pointer-events-none"></div>
                </div>
                
                {/* Text Label Area - Extra Compact & Small Font */}
                <div className="h-5 sm:h-6 shrink-0 flex flex-col items-center justify-center z-10 pt-1">
                    <span className="font-serif font-bold text-[8px] sm:text-[9px] tracking-[0.1em] text-slate-900 uppercase text-center leading-none">
                        {card.englishName}
                    </span>
                </div>
                
                {/* Reversed Indicator */}
                {isReversed && (
                    <div className="absolute top-2 right-2 z-30 opacity-70">
                         <div className="w-3 h-3 rounded-full bg-red-900/10 flex items-center justify-center border border-red-900/30">
                            <span className="text-[7px] text-red-900 font-bold leading-none">R</span>
                         </div>
                    </div>
                )}
            </div>
        ) : (
          // Empty State (Should rarely happen)
           <div className="w-full h-full bg-[#fdfbf7]"></div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [question, setQuestion] = useState('');
  const [appState, setAppState] = useState<AppState>('INPUT');
  const [selectedSpread, setSelectedSpread] = useState<Spread | null>(null);
  const [manualSpreadId, setManualSpreadId] = useState<string>('auto');
  const [deck, setDeck] = useState<TarotCard[]>([]);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [reading, setReading] = useState('');
  const [useProModel, setUseProModel] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatThinking, setIsChatThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const readingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (appState === 'READING' && readingRef.current) {
        readingRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [appState]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isChatThinking]);

  const handleStart = async () => {
    if (!question.trim()) return;
    setErrorMsg('');
    setChatHistory([]); // Clear previous chat

    try {
        const modelName = useProModel ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
        let spread: Spread | undefined;

        // 1. Determine Spread
        if (manualSpreadId !== 'auto') {
            // Manual selection: Skip AI intent analysis
            spread = SPREADS.find(s => s.id === manualSpreadId);
            if (!spread) spread = SPREADS[1]; // Fallback
            setSelectedSpread(spread);
        } else {
            // Auto: Use AI
            setAppState('ANALYZING_INTENT');
            const spreadId = await analyzeIntentAndSelectSpread(question, modelName);
            spread = SPREADS.find(s => s.id === spreadId) || SPREADS[1];
            setSelectedSpread(spread);
        }
        
        // 2. Shuffle
        setAppState('SHUFFLING');
        const randomInts = await getQuantumRandomNumbers(78);
        
        const newDeck = [...TAROT_DECK];
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = randomInts[i % randomInts.length] % (i + 1);
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        
        setDeck(newDeck);
        setDrawnCards([]);
        setReading('');
        
        setTimeout(() => {
            setAppState('DRAWING');
        }, 1500);

    } catch (e) {
        console.error(e);
        setErrorMsg("连接宇宙能量失败，请重试。");
        setAppState('INPUT');
    }
  };

  const handleDrawCard = () => {
    if (!selectedSpread || drawnCards.length >= selectedSpread.positions.length) return;

    const nextIndex = drawnCards.length;
    const card = deck[nextIndex];
    const isReversed = Math.random() > 0.5;

    const newDrawnCard: DrawnCard = {
        ...card,
        isReversed,
        spreadPositionIndex: nextIndex
    };

    const newDrawnCards = [...drawnCards, newDrawnCard];
    setDrawnCards(newDrawnCards);

    if (newDrawnCards.length === selectedSpread.positions.length) {
        setAppState('READING');
        startReading(newDrawnCards);
    }
  };

  const startReading = async (cards: DrawnCard[]) => {
      if (!selectedSpread) return;
      
      const modelName = useProModel ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
      
      try {
          const stream = await getReadingStream(question, selectedSpread, cards, modelName);
          
          for await (const chunk of stream) {
              const text = chunk.text;
              if (text) {
                  setReading(prev => prev + text);
              }
          }
      } catch (e) {
          console.error(e);
          setReading(prev => prev + "\n\n(连接中断，请稍后再试...)");
      }
  };
  
  const handleSendChat = async () => {
      if (!chatInput.trim() || isChatThinking || !selectedSpread) return;
      
      const userMsg: ChatMessage = { role: 'user', text: chatInput };
      const newHistory = [...chatHistory, userMsg];
      setChatHistory(newHistory);
      setChatInput('');
      setIsChatThinking(true);
      
      const modelName = useProModel ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
      
      try {
          const stream = await getFollowUpStream(
              chatHistory, 
              userMsg.text,
              {
                  question,
                  spread: selectedSpread,
                  cards: drawnCards,
                  initialReading: reading
              },
              modelName
          );

          // Append placeholder for AI response
          const aiMsg: ChatMessage = { role: 'model', text: '' };
          let updatedHistory = [...newHistory, aiMsg];
          setChatHistory(updatedHistory);

          for await (const chunk of stream) {
              const text = chunk.text;
              if (text) {
                 // Update the last message in history
                 updatedHistory = [...updatedHistory];
                 updatedHistory[updatedHistory.length - 1] = {
                     ...updatedHistory[updatedHistory.length - 1],
                     text: updatedHistory[updatedHistory.length - 1].text + text
                 };
                 setChatHistory(updatedHistory);
              }
          }
      } catch (e) {
          console.error(e);
          // Append error message
           setChatHistory(prev => [...prev, { role: 'model', text: "(连接中断，请重试...)" }]);
      } finally {
          setIsChatThinking(false);
      }
  };

  const reset = () => {
      setQuestion('');
      setReading('');
      setDrawnCards([]);
      setChatHistory([]);
      setAppState('INPUT');
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 font-sans text-white overflow-x-hidden relative">
      {/* Background Texture Overlay for the whole app */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse-slow"></div>

      {/* Header */}
      <header className="py-8 text-center animate-float relative z-10">
        <h1 className="font-serif text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-mystic-gold via-[#fff8dc] to-mystic-gold mb-2 tracking-widest drop-shadow-[0_2px_10px_rgba(255,215,0,0.3)]">
            QUANTUM TAROT
        </h1>
        <div className="h-[1px] w-32 mx-auto bg-gradient-to-r from-transparent via-mystic-gold to-transparent my-3 opacity-60"></div>
        <p className="text-sm md:text-base text-gray-300 font-light tracking-[0.3em] uppercase opacity-80">
            基于量子涨落的真随机占卜
        </p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl flex-1 flex flex-col items-center justify-center min-h-[50vh] relative z-10 pb-20">
        
        {appState === 'INPUT' && (
            <div className="w-full max-w-lg space-y-8 animate-pulse-slow">
                <div className="space-y-4">
                    <label className="block text-center text-xl font-serif text-mystic-gold/90 drop-shadow-md">
                        心中默念你的问题...
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-mystic-accent to-mystic-gold opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="例如：这段关系未来的发展如何？"
                            className="relative w-full h-40 bg-[#1a1a2e]/80 border border-mystic-gold/30 rounded-lg p-6 text-center text-lg focus:outline-none focus:border-mystic-gold/80 transition-all resize-none placeholder-gray-500 shadow-xl backdrop-blur-sm"
                        />
                    </div>
                </div>

                {/* Controls Area */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
                    {/* Spread Selection Dropdown */}
                    <div className="relative w-full md:w-auto min-w-[200px]">
                        <select 
                            value={manualSpreadId}
                            onChange={(e) => setManualSpreadId(e.target.value)}
                            className="w-full appearance-none bg-black/40 border border-gray-700 hover:border-mystic-gold/50 text-white py-2 pl-4 pr-10 rounded-full focus:outline-none focus:border-mystic-gold transition-colors font-serif tracking-wide text-sm cursor-pointer"
                        >
                            <option value="auto">✨ AI 智能推荐牌阵</option>
                            {SPREADS.map(spread => (
                                <option key={spread.id} value={spread.id}>{spread.name}</option>
                            ))}
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                    
                    {/* Model Toggle */}
                    <div className="flex items-center justify-center space-x-4 bg-black/40 p-2 pr-6 rounded-full border border-gray-700 cursor-pointer hover:border-mystic-gold/50 transition-colors" onClick={() => setUseProModel(!useProModel)}>
                        <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-500 relative ${useProModel ? 'bg-gradient-to-r from-mystic-accent to-purple-600' : 'bg-gray-700'}`}>
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 absolute top-1 ${useProModel ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                        <span className={`text-sm tracking-wider font-serif transition-colors ${useProModel ? 'text-white font-bold drop-shadow-[0_0_8px_rgba(157,80,187,0.8)]' : 'text-gray-400'}`}>
                            {useProModel ? 'PRO' : 'FLASH'}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleStart}
                    disabled={!question.trim()}
                    className="w-full py-4 bg-gradient-to-r from-[#24243e] via-[#302b63] to-[#24243e] border border-mystic-gold/40 rounded-lg text-xl font-serif tracking-[0.2em] hover:bg-mystic-800 hover:border-mystic-gold hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-mystic-gold/90"
                >
                    开始连接
                </button>
                {errorMsg && <p className="text-red-400 text-center text-sm bg-red-900/20 py-2 rounded">{errorMsg}</p>}
            </div>
        )}

        {appState === 'ANALYZING_INTENT' && (
            <div className="text-center space-y-6">
                <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-t-2 border-mystic-gold rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-r-2 border-mystic-accent rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '2s'}}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">✨</span>
                    </div>
                </div>
                <p className="font-serif tracking-widest text-lg animate-pulse text-mystic-gold">
                    解析意图...
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-widest">
                   Accessing {useProModel ? 'Gemini 3.0 Pro' : 'Gemini 2.5 Flash'}
                </p>
            </div>
        )}

        {appState === 'SHUFFLING' && (
            <div className="text-center space-y-8">
                 <div className="relative w-48 h-80 mx-auto perspective-1000">
                    <div className="absolute inset-0 bg-mystic-gold/10 animate-ping rounded-xl blur-xl"></div>
                    <CardVisual isRevealed={false} className="animate-pulse shadow-[0_0_50px_rgba(157,80,187,0.4)]" />
                 </div>
                <div className="space-y-2">
                    <p className="font-serif tracking-widest text-xl text-mystic-gold">
                        量子纠缠同步中
                    </p>
                    <p className="text-xs text-mystic-accent/80 tracking-widest uppercase">
                        从真空中提取随机熵源
                    </p>
                </div>
            </div>
        )}

        {appState === 'DRAWING' && selectedSpread && (
            <div className="w-full flex flex-col items-center space-y-10">
                <div className="text-center animate-fade-in">
                    <h2 className="font-serif text-3xl text-mystic-gold mb-3 tracking-wider drop-shadow-md">{selectedSpread.name}</h2>
                    <p className="text-gray-400 text-sm max-w-md mx-auto italic font-serif opacity-80">"{selectedSpread.description}"</p>
                </div>

                {/* Deck Area */}
                <div className="h-80 flex items-center justify-center mb-4 relative w-full">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-mystic-gold/5 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div onClick={handleDrawCard} className="cursor-pointer hover:-translate-y-4 transition-transform duration-500 z-10 group">
                         <CardVisual isRevealed={false} className="shadow-2xl group-hover:shadow-[0_0_40px_rgba(255,215,0,0.3)]" />
                         <p className="text-center mt-6 text-xs tracking-[0.3em] text-mystic-gold/70 group-hover:text-mystic-gold transition-colors uppercase">点击抽牌</p>
                    </div>
                </div>

                {/* Spread Slots Preview */}
                <div className="flex flex-wrap justify-center gap-6 px-4">
                     {drawnCards.map((card, idx) => (
                         <div key={idx} className="flex flex-col items-center animate-flip" style={{animationDelay: `${idx * 0.1}s`}}>
                            <CardVisual card={card} isRevealed={true} isReversed={card.isReversed} small />
                            <span className="text-[10px] uppercase tracking-widest mt-3 text-gray-400 bg-black/30 px-2 py-1 rounded-full border border-gray-800">{selectedSpread.positions[idx].name}</span>
                         </div>
                     ))}
                     {/* Empty slots placeholders */}
                     {Array.from({length: selectedSpread.positions.length - drawnCards.length}).map((_, i) => (
                         <div key={`empty-${i}`} className="w-24 h-40 border-2 border-dashed border-gray-700/50 rounded-xl flex items-center justify-center bg-black/20 backdrop-blur-sm">
                             <span className="text-gray-600 text-[10px] text-center px-2 uppercase tracking-wide">{selectedSpread.positions[drawnCards.length + i].name}</span>
                         </div>
                     ))}
                </div>
            </div>
        )}

        {appState === 'READING' && selectedSpread && (
            <div ref={readingRef} className="w-full flex flex-col lg:flex-row gap-8 animate-fade-in pb-12 px-4 md:px-0">
                {/* Left: Spread Visual */}
                <div className="lg:w-1/3 flex flex-col items-center space-y-4 order-2 lg:order-1 bg-[#0f0c29]/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-md h-fit sticky top-4">
                     <h3 className="font-serif text-xl text-mystic-gold mb-6 pb-2 border-b border-mystic-gold/20 w-full text-center tracking-widest">
                        牌阵格局
                     </h3>
                     <div className="grid grid-cols-1 gap-4 w-full max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {drawnCards.map((card, idx) => (
                            <div key={idx} className="flex items-start space-x-4 bg-black/40 p-3 rounded-lg border border-gray-800 hover:border-mystic-gold/30 transition-colors group">
                                <div className="shrink-0 transform scale-75 origin-top-left -mr-4 -mb-8">
                                    <CardVisual card={card} isRevealed={true} isReversed={card.isReversed} small />
                                </div>
                                <div className="pt-1 pl-2">
                                    <p className="text-[10px] text-mystic-accent uppercase tracking-widest mb-1">
                                        {selectedSpread.positions[idx].name}
                                    </p>
                                    <p className="font-serif text-sm text-[#e6e2d3] group-hover:text-mystic-gold transition-colors">
                                        {card.name} 
                                        {card.isReversed && <span className="text-red-400 text-xs ml-2">(逆位)</span>}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 italic leading-relaxed line-clamp-2">{card.description}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                     <button onClick={reset} className="mt-8 px-8 py-3 border border-gray-600 rounded-full text-xs uppercase tracking-[0.2em] text-gray-400 hover:text-white hover:border-mystic-gold hover:bg-mystic-gold/10 transition-all w-full">
                         开启新占卜
                     </button>
                </div>

                {/* Right: AI Reading & Chat */}
                <div className="lg:w-2/3 flex flex-col gap-8 order-1 lg:order-2">
                    
                    {/* Main Reading Card */}
                    <div className="bg-gradient-to-br from-[#1a1a2e]/90 to-[#0f0c29]/90 border border-mystic-gold/20 rounded-xl p-8 md:p-10 shadow-2xl backdrop-blur-md relative min-h-[400px]">
                        {/* Decorative corners */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-mystic-gold/50 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-mystic-gold/50 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-mystic-gold/50 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-mystic-gold/50 rounded-br-lg"></div>
                        
                        <h2 className="font-serif text-3xl mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-mystic-gold via-[#fff8dc] to-mystic-gold drop-shadow-sm tracking-widest">
                            星 辰 启 示
                        </h2>
                        
                        <div className={`
                            prose prose-invert prose-lg max-w-none font-light whitespace-normal
                            [&>h3]:text-xl [&>h3]:text-mystic-gold [&>h3]:font-serif [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:tracking-wider
                            [&>p]:text-gray-300 [&>p]:leading-7 [&>p]:mb-4
                            [&>strong]:text-[#fff8dc] [&>strong]:font-semibold
                            [&>ul]:list-none [&>ul]:space-y-2 [&>ul]:my-4
                            [&>ul>li]:relative [&>ul>li]:pl-6
                            [&>ul>li]:before:content-['✦'] [&>ul>li]:before:absolute [&>ul>li]:before:left-0 [&>ul>li]:before:text-mystic-accent
                        `}>
                            {reading ? (
                                <div dangerouslySetInnerHTML={{ __html: reading }} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-60 space-y-6">
                                    <div className="flex space-x-3">
                                        <div className="w-3 h-3 bg-mystic-gold rounded-full animate-bounce"></div>
                                        <div className="w-3 h-3 bg-mystic-gold rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                                        <div className="w-3 h-3 bg-mystic-gold rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                                    </div>
                                    <p className="text-sm font-serif tracking-[0.2em] text-gray-500 animate-pulse">
                                        正在解读星象轨迹...
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat / Follow-up Section */}
                    {reading && !reading.includes('正在解读') && (
                        <div className="bg-[#0f0c29]/60 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm animate-fade-in flex flex-col h-[600px]">
                            <h3 className="font-serif text-xl text-mystic-gold/80 mb-4 tracking-wider flex items-center gap-2">
                                <span className="text-2xl">🔮</span> 
                                追问神谕 (Oracle's Whisper)
                            </h3>
                            
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-4 pr-2">
                                {chatHistory.length === 0 && (
                                    <p className="text-gray-500 text-sm text-center italic mt-10">
                                        对刚才的解读还有疑问？请在此向宇宙继续提问...
                                    </p>
                                )}
                                {chatHistory.map((msg, index) => (
                                    <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`
                                            max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed
                                            ${msg.role === 'user' 
                                                ? 'bg-mystic-800 text-gray-100 rounded-tr-sm border border-mystic-gold/20' 
                                                : 'bg-black/30 text-gray-300 rounded-tl-sm border border-gray-800'}
                                        `}>
                                            <div className="whitespace-pre-wrap">{msg.text}</div>
                                        </div>
                                    </div>
                                ))}
                                {isChatThinking && (
                                    <div className="flex justify-start">
                                         <div className="bg-black/30 rounded-2xl rounded-tl-sm px-5 py-3 border border-gray-800 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                         </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                    placeholder="输入你的追问..."
                                    disabled={isChatThinking}
                                    className="w-full bg-[#1a1a2e] border border-gray-700 rounded-full py-3 pl-5 pr-14 text-sm text-white focus:outline-none focus:border-mystic-gold/60 transition-colors disabled:opacity-50 placeholder-gray-600"
                                />
                                <button 
                                    onClick={handleSendChat}
                                    disabled={!chatInput.trim() || isChatThinking}
                                    className="absolute right-1 top-1 bottom-1 w-10 h-10 bg-mystic-gold/10 rounded-full flex items-center justify-center text-mystic-gold hover:bg-mystic-gold hover:text-black transition-all disabled:opacity-0"
                                >
                                    <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V5m0 0l-7 7m7-7l7 7"></path></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
      </main>
    </div>
  );
}