import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Wand2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { QuestionType } from "@shared/schema";

interface AIQuestionGeneratorProps {
  onQuestionsGenerated: (questions: Array<{
    text: string;
    type: QuestionType;
    options?: string[] | null;
    required: boolean;
  }>) => void;
}

export function AIQuestionGenerator({ onQuestionsGenerated }: AIQuestionGeneratorProps) {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);

  const generateQuestionsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/generate-questions", {
        topic,
        description,
        numQuestions,
      });
      return await res.json();
    },
    onSuccess: (questions) => {
      if (Array.isArray(questions) && questions.length > 0) {
        onQuestionsGenerated(
          questions.map((q) => ({
            text: q.text,
            type: q.type,
            options: q.options || null,
            order: 0, // will be set in parent component
            required: q.required,
          }))
        );
        toast({
          title: "Questions generated!",
          description: `Created ${questions.length} questions based on your topic.`,
        });
      } else {
        toast({
          title: "Error generating questions",
          description: "No questions were generated. Please try again with a different topic.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error generating questions",
        description: error.message || "Failed to generate questions using AI.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a survey topic to generate questions.",
        variant: "destructive",
      });
      return;
    }
    generateQuestionsMutation.mutate();
  };

  return (
    <Card className="shadow-md border-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Question Generator
        </CardTitle>
        <CardDescription className="text-white/80">
          Use AI to create relevant survey questions based on your topic
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Survey Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., Customer Satisfaction, Employee Engagement"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="border-gray-300"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide additional context about the survey purpose"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-gray-300 min-h-[80px]"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="num-questions">Number of Questions</Label>
              <span className="text-sm font-medium">{numQuestions}</span>
            </div>
            <Slider
              id="num-questions"
              min={3}
              max={10}
              step={1}
              value={[numQuestions]}
              onValueChange={(value) => setNumQuestions(value[0])}
              className="py-2"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2 pb-4">
        <Button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          disabled={generateQuestionsMutation.isPending || !topic.trim()}
        >
          {generateQuestionsMutation.isPending ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Questions
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}