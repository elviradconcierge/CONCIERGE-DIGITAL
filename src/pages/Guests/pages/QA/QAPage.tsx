/**
 * Q&A Page
 *
 * Browse frequently asked questions organized by category
 * Ask questions and get AI-powered answers
 */

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Send, Loader2 } from "lucide-react";
import {
  useActiveQARecommendations,
  groupByCategory,
} from "../../../../hooks/queries/hotel-management/qa-recommendations";
import { getGuestSession } from "../../../../services/guestAuth.service";
import { supabase } from "../../../../lib/supabase";

export const QAPage = () => {
  // Get hotel ID from guest session
  const session = getGuestSession();
  const hotelId = session?.guestData?.hotel_id || "";

  // Question input state
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  console.log("❓ [QAPage] Guest session:", {
    hasSession: !!session,
    hotelId,
    guestId: session?.guestData?.id,
    roomNumber: session?.guestData?.room_number,
  });

  // Fetch active Q&A recommendations
  const {
    data: qaItems = [],
    isLoading,
    error,
  } = useActiveQARecommendations(hotelId);

  console.log("❓ [QAPage] Query state:", {
    isLoading,
    hasError: !!error,
    error: error?.message,
    itemsCount: qaItems.length,
    hotelId,
  });

  if (qaItems.length > 0) {
    console.log("✅ [QAPage] First Q&A item:", {
      id: qaItems[0].id,
      question: qaItems[0].question,
      category: qaItems[0].category,
      isActive: qaItems[0].is_active,
    });
  }

  // Group Q&A by category
  const categorizedQA = useMemo(() => {
    const grouped = groupByCategory(qaItems);
    console.log("📊 [QAPage] Categorized Q&A:", {
      categories: Object.keys(grouped),
      totalCategories: Object.keys(grouped).length,
      itemsPerCategory: Object.entries(grouped).map(([cat, items]) => ({
        category: cat,
        count: items.length,
      })),
    });
    return grouped;
  }, [qaItems]);

  // Track expanded items (category-index format)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (category: string, index: number) => {
    const key = `${category}-${index}`;
    const newExpanded = new Set(expandedItems);

    if (newExpanded.has(key)) {
      console.log(`🔽 [QAPage] Collapsing item: ${key}`);
      newExpanded.delete(key);
    } else {
      console.log(`🔼 [QAPage] Expanding item: ${key}`);
      newExpanded.add(key);
    }

    setExpandedItems(newExpanded);
  };

  // Handle AI question
  const handleAskQuestion = async () => {
    if (!question.trim() || !hotelId) return;

    setIsAsking(true);
    setAskError(null);
    setAiAnswer(null);

    console.log("🤖 [QAPage] Asking AI question:", { question, hotelId });

    try {
      const { data, error } = await supabase.functions.invoke(
        "openai-analyzer",
        {
          body: {
            task: "answer_question",
            text: question,
            hotel_id: hotelId,
          },
        }
      );

      if (error) throw error;

      console.log("✅ [QAPage] AI response:", data);

      if (data?.results?.answer) {
        setAiAnswer(data.results.answer);
      } else {
        setAskError("No answer received from AI");
      }
    } catch (err) {
      console.error("❌ [QAPage] Error asking question:", err);
      setAskError(err instanceof Error ? err.message : "Failed to get answer");
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isAsking) {
      handleAskQuestion();
    }
  };

  console.log("🎨 [QAPage] Rendering with:", {
    isLoading,
    totalItems: qaItems.length,
    hasCategories: Object.keys(categorizedQA).length > 0,
    expandedCount: expandedItems.size,
  });

  if (isLoading) {
    console.log("⏳ [QAPage] Showing loading state");
    return (
      <div>
        {/* Search/Ask Question Header */}
        <div className="px-4 py-3 bg-gradient-to-br from-indigo-50 to-purple-50 mb-3">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Ask a Question
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question here..."
              disabled={isAsking}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAskQuestion}
              disabled={isAsking || !question.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isAsking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Asking...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="text-sm">Ask</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="px-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Loading questions...
          </h2>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (qaItems.length === 0) {
    console.log("❌ [QAPage] No Q&A items - showing empty state", {
      hotelId,
      isLoading,
      hasError: !!error,
    });
    return (
      <div>
        {/* Search/Ask Question Header */}
        <div className="px-4 py-3 bg-gradient-to-br from-indigo-50 to-purple-50 mb-3">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Ask a Question
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question here..."
              disabled={isAsking}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAskQuestion}
              disabled={isAsking || !question.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isAsking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Asking...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="text-sm">Ask</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Answer Display */}
        {aiAnswer && (
          <div className="px-4 mb-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="text-green-600 text-lg">✓</div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-green-800 mb-1">
                    Answer:
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {aiAnswer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {askError && (
          <div className="px-4 mb-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-600">{askError}</p>
            </div>
          </div>
        )}

        <div className="px-4">
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-5xl mb-3">❓</div>
            <p className="text-gray-600 text-sm mb-1">No Q&A available</p>
            <p className="text-xs text-gray-500">
              But you can still ask questions using the search box above
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {/* Search/Ask Question Header */}
      <div className="px-4 py-3 bg-gradient-to-br from-indigo-50 to-purple-50 mb-3">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">
          Ask a Question
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question here..."
            disabled={isAsking}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleAskQuestion}
            disabled={isAsking || !question.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isAsking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Asking...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="text-sm">Ask</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Answer Display */}
      {aiAnswer && (
        <div className="px-4 mb-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="text-green-600 text-lg">✓</div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-green-800 mb-1">
                  Answer:
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {aiAnswer}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {askError && (
        <div className="px-4 mb-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600">{askError}</p>
          </div>
        </div>
      )}

      {/* Browse Q&A Header */}
      <div className="px-4 mb-2">
        <h2 className="text-sm font-semibold text-gray-700">
          Or browse common questions:
        </h2>
      </div>

      {/* Q&A Items grouped by category */}
      <div className="px-4">
        {Object.entries(categorizedQA).map(([category, items]) => (
          <div key={category} className="mb-4">
            {/* Category Header */}
            <div className="flex items-center mb-2">
              <h2 className="text-base font-bold text-gray-900">{category}</h2>
              <span className="ml-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                {items.length}
              </span>
            </div>

            {/* Q&A Items */}
            <div className="space-y-2">
              {items.map((item, index) => {
                const key = `${category}-${index}`;
                const isExpanded = expandedItems.has(key);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    {/* Question - Always Visible */}
                    <button
                      onClick={() => toggleItem(category, index)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="font-medium text-sm text-gray-900 pr-3 leading-snug">
                        {item.question || "No question available"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {/* Answer - Expandable */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 border-t border-gray-100">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {item.answer || "No answer available"}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
