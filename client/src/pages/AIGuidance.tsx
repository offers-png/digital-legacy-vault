import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Send, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

const Streamdown = lazy(() => import("streamdown").then((m) => ({ default: m.Streamdown })));

export default function AIGuidance() {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);

  // Fetch gap analysis
  const { data: gapAnalysis, isLoading: isLoadingGap } = trpc.aiExecutor.getGapAnalysis.useQuery();

  // Get estate guidance mutation
  const getGuidanceMutation = trpc.aiExecutor.getEstateGuidance.useMutation({
    onSuccess: (data) => {
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: question },
        { role: "assistant", content: data.guidance },
      ]);
      setQuestion("");
      setIsAsking(false);
    },
    onError: (error) => {
      toast.error("Failed to get guidance: " + error.message);
      setIsAsking(false);
    },
  });

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setIsAsking(true);
    try {
      await getGuidanceMutation.mutateAsync({ question });
    } catch (error) {
      console.error("Error asking question:", error);
    }
  };

  const suggestedQuestions = [
    "What digital assets should I prioritize storing?",
    "How do I prepare my digital estate for my family?",
    "What are the legal considerations for digital assets?",
    "How should I organize my passwords and access information?",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Digital Executor</h1>
          <p className="text-muted-foreground">
            Get personalized advice on managing your digital estate
          </p>
        </div>

        {/* Gap Analysis Summary */}
        {gapAnalysis && !isLoadingGap && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Your Estate Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Coverage Progress</span>
                  <span className="text-sm font-bold text-blue-600">{gapAnalysis.coverage}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${gapAnalysis.coverage}%` }}
                  />
                </div>
              </div>

              {gapAnalysis.missingCategories.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Missing asset categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {gapAnalysis.missingCategories.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"
                      >
                        {cat.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {gapAnalysis.recommendations}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Ask the AI Digital Executor</CardTitle>
            <CardDescription>
              Get personalized guidance on digital estate planning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-slate-50 rounded-lg">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white border border-gray-200 rounded-bl-none"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Suspense fallback={<p className="text-sm whitespace-pre-wrap">{msg.content}</p>}>
                          <Streamdown>{msg.content}</Streamdown>
                        </Suspense>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Questions */}
            {chatHistory.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">Suggested questions:</p>
                <div className="space-y-2">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQuestion(q);
                      }}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="space-y-3 border-t pt-4">
              <Textarea
                placeholder="Ask a question about digital estate planning..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleAskQuestion();
                  }
                }}
              />
              <Button
                onClick={handleAskQuestion}
                disabled={isAsking || !question.trim()}
                className="w-full gap-2"
              >
                <Send className="w-4 h-4" />
                {isAsking ? "Thinking..." : "Ask"}
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900">
                This AI provides general guidance only and is not a substitute for professional legal or financial advice.
                Consult with professionals for specific legal or tax matters.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Digital Estate Planning Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-semibold mb-1">Key Topics to Cover:</p>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>Cryptocurrency and digital wallets</li>
                <li>Social media and online accounts</li>
                <li>Domain names and websites</li>
                <li>Email and cloud storage</li>
                <li>Online banking and investments</li>
                <li>Digital photos and memories</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
