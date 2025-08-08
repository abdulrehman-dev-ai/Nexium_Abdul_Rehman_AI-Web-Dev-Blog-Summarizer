"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Globe, FileText, Languages, Sparkles, ExternalLink, Check, Copy, History, Database } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { saveSummaryToSupabase, getSummariesFromSupabase, checkUrlExists, SummaryRecord } from "@/lib/supabase";

export default function Home() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [urduSummary, setUrduSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedUrdu, setCopiedUrdu] = useState(false);
  const [previousSummaries, setPreviousSummaries] = useState<SummaryRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [existingSummary, setExistingSummary] = useState<SummaryRecord | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<SummaryRecord | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    console.log('Current theme in Home component:', theme);
    console.log('Document has dark class:', document.documentElement.classList.contains('dark'));
  }, [theme]);

  useEffect(() => {
    getSummariesFromSupabase().then(setPreviousSummaries);
  }, []);

  const loadPreviousSummaries = async () => {
    try {
      const summaries = await getSummariesFromSupabase(10);
      setPreviousSummaries(summaries || []);
    } catch (error) {
      console.error('Error loading previous summaries:', error);
    }
  };

  const isValidUrl = (url: string) => {
    const regex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    return regex.test(url);
  };

  const handleSummarize = async () => {
    setError("");
    setSummary("");
    setUrduSummary("");
    setExistingSummary(null);
    
    if (!url.trim()) {
      setError("Please enter a blog URL");
      return;
    }
    
    if (!isValidUrl(url)) {
      setError("Please enter a valid URL (e.g., https://example.com/blog-post)");
      return;
    }

    setLoading(true);
    
    try {
      // Always generate fresh summaries - removed caching check for real-time processing
      setLoadingStep("Fetching blog content...");
      
      setLoadingStep("Processing content...");
      const response = await axios.post('/api/process-blog', { url });
      
      if (response.data.success) {
        const { englishSummary, urduSummary } = response.data.data;
        
        setLoadingStep("Saving to database...");
        try {
          await saveSummaryToSupabase(url, englishSummary, urduSummary);
          console.log('Summary saved to Supabase successfully');
          
          await loadPreviousSummaries();
        } catch (supabaseError) {
          console.error('Error saving to Supabase:', supabaseError);
        }
        
        setLoadingStep("Finalizing...");
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setSummary(englishSummary);
        setUrduSummary(urduSummary);
        
        console.log('Blog processed and saved to databases successfully');
      } else {
        throw new Error(response.data.error || 'Failed to process blog');
      }
      
    } catch (error) {
      console.error("Error:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        setError(`Failed to process the blog: ${errorMessage}`);
      } else {
        setError("Failed to process the blog. Please check the URL and try again.");
      }
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'summary') {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } else {
      setCopiedUrdu(true);
      setTimeout(() => setCopiedUrdu(false), 2000);
    }
  };

  useEffect(() => {
    if (selectedSummary) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedSummary]);

  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Enhanced Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Light Theme Orbs - Emerald/Teal/Cyan palette */}
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-emerald-400/30 to-teal-400/30 rounded-full blur-3xl dark:opacity-0"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-r from-teal-400/25 to-cyan-400/25 rounded-full blur-3xl dark:opacity-0"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 rounded-full blur-3xl dark:opacity-0"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Dark Theme Orbs - Enhanced purple/indigo/violet palette */}
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-600/40 to-violet-600/40 rounded-full blur-3xl opacity-0 dark:opacity-100"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-r from-indigo-600/35 to-purple-600/35 rounded-full blur-3xl opacity-0 dark:opacity-100"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-72 h-72 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 rounded-full blur-3xl opacity-0 dark:opacity-100"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-600/25 to-purple-600/25 rounded-full blur-3xl opacity-0 dark:opacity-100"
          animate={{
            scale: [1.1, 0.9, 1.1],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-2xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              className="flex items-center justify-center space-x-3 mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles className="w-10 h-10 text-emerald-600 dark:text-violet-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                Blog Summariser
              </h1>
            </motion.div>
            <p className="text-lg text-emerald-700/80 dark:text-violet-300/90 font-medium">
              Transform any blog into concise summaries and seamless Urdu translations
            </p>
          </motion.div>

          {/* Input Section */}
          <motion.div
            className="glass-light dark:glass-dark rounded-3xl p-8 space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-violet-300">
                <Globe className="w-5 h-5" />
                <label className="text-sm font-semibold">Enter Blog URL</label>
              </div>
              <div className="relative">
                <ExternalLink className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-500 dark:text-violet-400" />
                <Input
                  type="url"
                  placeholder="https://example.com/blog-post"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white/70 dark:bg-gray-800/50 border-emerald-200/50 dark:border-violet-500/30 focus:border-emerald-400 dark:focus:border-violet-400 focus:ring-emerald-400/20 dark:focus:ring-violet-400/20 rounded-2xl text-emerald-900 dark:text-violet-100 placeholder:text-emerald-500/60 dark:placeholder:text-violet-400/60"
                />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleSummarize}
                disabled={!url.trim() || loading}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-violet-600 dark:to-purple-600 hover:from-emerald-600 hover:to-teal-600 dark:hover:from-violet-700 dark:hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <motion.div
                    className="flex items-center space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{loadingStep}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    className="flex items-center space-x-2"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Languages className="w-5 h-5" />
                    <span>Summarize & Translate</span>
                  </motion.div>
                )}
              </Button>
            </motion.div>

            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="inline mr-2" />
              {showHistory ? "Hide History" : "Show History"}
            </Button>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence>
            {(summary || urduSummary) && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                {/* English Summary */}
                {summary && (
                  <motion.div
                    className="relative group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <div className="glass-light dark:glass-dark rounded-3xl p-8 space-y-6 border-2 border-emerald-200/30 dark:border-violet-500/30 hover:border-emerald-300/50 dark:hover:border-violet-400/50 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-emerald-500/10 dark:group-hover:shadow-violet-500/20">
                      {/* Header with enhanced styling */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-violet-900/50 dark:to-purple-900/50 shadow-lg">
                            <FileText className="w-6 h-6 text-emerald-600 dark:text-violet-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-emerald-800 dark:text-violet-300">English Summary</h3>
                            <p className="text-sm text-emerald-600/70 dark:text-violet-400/70">AI-generated content summary</p>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => copyToClipboard(summary, 'summary')}
                          className="group/copy p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-violet-900/30 dark:to-purple-900/30 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-violet-800/40 dark:hover:to-purple-800/40 text-emerald-600 dark:text-violet-400 transition-all duration-300 shadow-lg hover:shadow-xl border border-emerald-200/50 dark:border-violet-500/30"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          title="Copy to clipboard"
                        >
                          <AnimatePresence mode="wait">
                            {copiedSummary ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="copy"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Copy className="w-5 h-5 group-hover/copy:scale-110 transition-transform duration-200" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>

                      {/* Enhanced content area */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl"></div>
                        <Textarea
                          value={summary}
                          readOnly
                          className="relative z-10 min-h-[160px] bg-white/80 dark:bg-gray-800/60 border-0 rounded-2xl text-emerald-900 dark:text-violet-100 resize-none focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-violet-400/30 text-base leading-relaxed p-6 shadow-inner backdrop-blur-sm"
                          style={{ fontFamily: 'inherit' }}
                        />
                        
                        {/* Word count and reading time */}
                        <div className="flex items-center justify-between mt-4 text-xs text-emerald-600/60 dark:text-violet-400/60">
                          <span>{summary.split(' ').length} words</span>
                          <span>~{Math.ceil(summary.split(' ').length / 200)} min read</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Urdu Summary */}
                {urduSummary && (
                  <motion.div
                    className="relative group"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <div className="glass-light dark:glass-dark rounded-3xl p-8 space-y-6 border-2 border-emerald-200/30 dark:border-violet-500/30 hover:border-emerald-300/50 dark:hover:border-violet-400/50 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-emerald-500/10 dark:group-hover:shadow-violet-500/20">
                      {/* Header with enhanced styling */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-violet-900/50 dark:to-purple-900/50 shadow-lg">
                            <Languages className="w-6 h-6 text-emerald-600 dark:text-violet-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-emerald-800 dark:text-violet-300 font-urdu">اردو خلاصہ</h3>
                            <p className="text-sm text-emerald-600/70 dark:text-violet-400/70">AI-translated summary</p>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => copyToClipboard(urduSummary, 'urdu')}
                          className="group/copy p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-violet-900/30 dark:to-purple-900/30 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-violet-800/40 dark:hover:to-purple-800/40 text-emerald-600 dark:text-violet-400 transition-all duration-300 shadow-lg hover:shadow-xl border border-emerald-200/50 dark:border-violet-500/30"
                          whileHover={{ scale: 1.05, rotate: -5 }}
                          whileTap={{ scale: 0.95 }}
                          title="Copy to clipboard"
                        >
                          <AnimatePresence mode="wait">
                            {copiedUrdu ? (
                              <motion.div
                                key="check"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="copy"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Copy className="w-5 h-5 group-hover/copy:scale-110 transition-transform duration-200" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>

                      {/* Enhanced content area */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl"></div>
                        <Textarea
                          value={urduSummary}
                          readOnly
                          className="relative z-10 min-h-[160px] bg-white/80 dark:bg-gray-800/60 border-0 rounded-2xl text-emerald-900 dark:text-violet-100 resize-none focus:ring-2 focus:ring-emerald-400/30 dark:focus:ring-violet-400/30 text-base leading-relaxed p-6 shadow-inner backdrop-blur-sm text-right font-urdu"
                          dir="rtl"
                          style={{ lineHeight: '1.8' }}
                        />
                        
                        {/* Word count and reading time */}
                        <div className="flex items-center justify-between mt-4 text-xs text-emerald-600/60 dark:text-violet-400/60 font-urdu">
                          <span>{urduSummary.split(' ').length} الفاظ</span>
                          <span>~{Math.ceil(urduSummary.split(' ').length / 150)} منٹ</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* History Section */}
          <AnimatePresence>
            {showHistory && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Database className="mr-2" /> Previous Summaries
                </h2>
                {previousSummaries.length === 0 ? (
                  <p>No previous summaries found.</p>
                ) : (
                  <ul className="space-y-4">
                    {previousSummaries
                      .slice()
                      .sort((a, b) => (b.created_at && a.created_at ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : 0))
                      .map((item) => (
                        <li
                          key={item.id}
                          className="p-4 rounded bg-white/80 shadow cursor-pointer hover:bg-emerald-50 dark:hover:bg-violet-900/30 transition"
                          onClick={() => setSelectedSummary(item)}
                          title="Click to view full summary"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {item.created_at ? new Date(item.created_at).toLocaleString() : "Unknown date"}
                            </span>
                            <span className="text-xs text-blue-600 truncate max-w-[200px] ml-2">{item.url}</span>
                          </div>
                          <div className="font-semibold mt-1 text-emerald-700 dark:text-violet-300">
                            {item.summary.slice(0, 80)}{item.summary.length > 80 ? "..." : ""}
                          </div>
                        </li>
                      ))}
                  </ul>
                )}

                {/* Modal for full summary */}
                {selectedSummary && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    onClick={() => setSelectedSummary(null)}
                  >
                    <div
                      className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-4xl w-full shadow-2xl relative max-h-[80vh] overflow-y-auto mx-4"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
                        onClick={() => setSelectedSummary(null)}
                        title="Close"
                      >
                        ×
                      </button>
                      <div className="mb-4">
                        <div className="mb-2 text-xs text-gray-500">
                          {selectedSummary.created_at ? new Date(selectedSummary.created_at).toLocaleString() : "Unknown date"}
                        </div>
                        <div className="mb-4 text-xs text-blue-600 break-all">{selectedSummary.url}</div>
                      </div>
                      
                      {/* English Summary Section */}
                      <div className="mb-6">
                        <div className="flex items-center mb-3">
                          <FileText className="w-5 h-5 text-emerald-600 dark:text-violet-400 mr-2" />
                          <h3 className="font-bold text-emerald-700 dark:text-violet-300">English Summary</h3>
                        </div>
                        <div className="whitespace-pre-line text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          {selectedSummary.summary}
                        </div>
                      </div>
                      
                      {/* Urdu Summary Section */}
                      {selectedSummary.urdu_summary && (
                        <div className="mb-4">
                          <div className="flex items-center mb-3">
                            <Languages className="w-5 h-5 text-emerald-600 dark:text-violet-400 mr-2" />
                            <h3 className="font-bold text-emerald-700 dark:text-violet-300 font-urdu">اردو خلاصہ</h3>
                          </div>
                          <div className="whitespace-pre-line text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg font-urdu text-right">
                            {selectedSummary.urdu_summary}
                          </div>
                        </div>
                      )}
                      
                      {!selectedSummary.urdu_summary && (
                        <div className="text-center text-gray-500 dark:text-gray-400 italic">
                          Urdu translation not available for this summary
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <p className="text-sm text-gray-900 dark:text-gray-100">
  Powered by{" "}
  <a 
    href="https://abdulrehmansarwar.vercel.app" 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 underline decoration-dotted underline-offset-2"
  >
    Abdul Rehman
  </a>{" "}
  with ❤️ • A{" "}
  <a 
    href="https://nexium.ltd" 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 underline decoration-dotted underline-offset-2"
  >
    Nexium.ltd
  </a>{" "}
  Summer Internship Project
</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}