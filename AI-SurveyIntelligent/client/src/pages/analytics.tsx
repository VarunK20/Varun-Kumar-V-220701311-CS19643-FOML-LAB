import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { AIInsights } from "@/components/analytics/ai-insights";
import { Charts } from "@/components/analytics/charts";
import { ResponseList } from "@/components/analytics/response-list";
import { SurveyPredictions } from "@/components/analytics/survey-predictions";
import { Button } from "@/components/ui/button";
import { Loader2, Share2, Download, FileText } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SurveyResults, Question, Answer } from "@shared/schema";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

export default function Analytics() {
  const [, params] = useRoute<{ id: string }>("/surveys/:id/analytics");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const surveyId = params?.id ? parseInt(params.id) : 0;

  // Fetch survey results
  const { data: results, isLoading, error } = useQuery<SurveyResults>({
    queryKey: [`/api/surveys/${surveyId}/results`],
    enabled: !!surveyId,
  });

  // Generate AI analysis
  const analysisMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/surveys/${surveyId}/analyze`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/surveys/${surveyId}/results`] });
      toast({
        title: "Analysis generated",
        description: "AI analysis has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate analysis",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading survey results",
        description: error.message,
        variant: "destructive",
      });
      navigate("/my-surveys");
    }
  }, [error, toast, navigate]);

  // Share results
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Survey results link copied to clipboard.",
    });
  };

  // References for chart elements
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  
  // Helper function to format question answers for PDF
  const formatAnswerData = (question: Question, answers: Answer[]) => {
    const questionAnswers = answers.filter(a => a.questionId === question.id);
    
    switch (question.type) {
      case 'multiple_choice':
        if (!question.options) return 'No options available';
        const optionCounts: Record<string, number> = {};
        question.options.forEach(option => { optionCounts[option] = 0; });
        
        questionAnswers.forEach(answer => {
          if (answer.value && typeof answer.value === 'string') {
            optionCounts[answer.value] = (optionCounts[answer.value] || 0) + 1;
          }
        });
        
        return Object.entries(optionCounts)
          .map(([option, count]) => `${option}: ${count} (${Math.round(count / questionAnswers.length * 100)}%)`)
          .join('\n');
        
      case 'checkbox':
        if (!question.options) return 'No options available';
        const checkboxCounts: Record<string, number> = {};
        question.options.forEach(option => { checkboxCounts[option] = 0; });
        
        questionAnswers.forEach(answer => {
          if (answer.value && Array.isArray(answer.value)) {
            answer.value.forEach(val => {
              checkboxCounts[val] = (checkboxCounts[val] || 0) + 1;
            });
          }
        });
        
        return Object.entries(checkboxCounts)
          .map(([option, count]) => `${option}: ${count} (${Math.round(count / questionAnswers.length * 100)}%)`)
          .join('\n');
        
      case 'text':
        return questionAnswers.map(a => a.value).join('\n• ');
        
      case 'rating':
        const ratings = questionAnswers.map(a => Number(a.value));
        const avg = ratings.reduce((sum, val) => sum + val, 0) / ratings.length;
        return `Average rating: ${avg.toFixed(1)} / 5`;
        
      default:
        return 'No data available';
    }
  };

  // Export report
  const handleExport = async () => {
    if (!results) return;
    
    setExportingPdf(true);
    toast({
      title: "Export started",
      description: "Your report is being generated, please wait...",
    });
    
    try {
      // Initialize PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Add header
      pdf.setFontSize(22);
      pdf.setTextColor(90, 40, 180); // Purple color
      pdf.text(`${results.title} - Survey Report`, 20, 20);
      
      // Add survey info
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Created: ${new Date(results.createdAt).toLocaleDateString()}`, 20, 30);
      pdf.text(`Total Responses: ${results.responses.length}`, 20, 36);
      
      // Add survey description
      if (results.description) {
        pdf.setFontSize(11);
        pdf.text('Description:', 20, 44);
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(10);
        
        const splitDescription = pdf.splitTextToSize(results.description, 170);
        pdf.text(splitDescription, 20, 50);
      }
      
      // Add AI insights if available
      let yPos = results.description ? 60 + (pdf.splitTextToSize(results.description, 170).length * 5) : 50;
      
      if (results.analysis?.insights) {
        try {
          pdf.setFontSize(14);
          pdf.setTextColor(90, 40, 180);
          pdf.text('AI-Generated Insights:', 20, yPos);
          
          // Parse insights if they're a string, otherwise use as-is
          let insights: any;
          try {
            insights = typeof results.analysis.insights === 'string' 
              ? JSON.parse(results.analysis.insights) 
              : results.analysis.insights;
          } catch (e) {
            insights = {};
          }
            
          if (insights && insights.keyInsights && Array.isArray(insights.keyInsights) && insights.keyInsights.length > 0) {
            yPos += 8;
            pdf.setFontSize(10);
            pdf.setTextColor(80, 80, 80);
            
            insights.keyInsights.forEach((insight: any, index: number) => {
              const insightText = `• ${insight.title} - ${insight.description}`;
              const splitInsight = pdf.splitTextToSize(insightText, 170);
              pdf.text(splitInsight, 20, yPos);
              yPos += splitInsight.length * 5 + 3;
            });
          }
        } catch (e) {
          // If insights JSON parsing fails, just continue without it
          console.error('Failed to parse insights:', e);
        }
      }
      
      yPos += 10;

      // Add response data table
      if (results.questions.length > 0 && results.responses.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(90, 40, 180);
        pdf.text('Response Summary:', 20, yPos);
        yPos += 10;

        // For each question, add a table with the response data
        for (const question of results.questions) {
          // If we're near the end of the page, add a new page
          if (yPos > 250) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.setFontSize(12);
          pdf.setTextColor(60, 60, 60);
          
          // Question text with required indicator
          const questionText = `Q: ${question.text}${question.required ? ' *' : ''}`;
          const splitQuestion = pdf.splitTextToSize(questionText, 170);
          pdf.text(splitQuestion, 20, yPos);
          
          yPos += splitQuestion.length * 6;
          
          // Format and add answer data
          const answersText = formatAnswerData(question, results.responses.flatMap(r => r.answers));
          
          if (answersText) {
            const rows = [];
            
            if (question.type === 'text') {
              // For text responses, show bulleted list
              pdf.setFontSize(10);
              pdf.setTextColor(100, 100, 100);
              
              const textResponses = answersText.split('\n• ');
              if (textResponses.length > 0) {
                textResponses.forEach((response, idx) => {
                  if (response.trim()) {
                    const bulletedResponse = idx === 0 ? `• ${response}` : `• ${response}`;
                    const splitResponse = pdf.splitTextToSize(bulletedResponse, 160);
                    pdf.text(splitResponse, 25, yPos);
                    yPos += splitResponse.length * 5 + 3;
                  }
                });
              } else {
                pdf.text('No text responses provided.', 25, yPos);
                yPos += 5;
              }
            } else {
              // For other types, use autotable
              const tableData = answersText.split('\n').map(line => [line]);
              
              autoTable(pdf, {
                startY: yPos,
                head: [['Response Summary']],
                body: tableData,
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: { fillColor: [120, 70, 200], textColor: [255, 255, 255] },
                margin: { left: 20, right: 20 }
              });
              
              // Update y position after table
              yPos = (pdf as any).lastAutoTable.finalY + 10;
            }
          } else {
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text('No response data available.', 25, yPos);
            yPos += 10;
          }
          
          // Add some space between questions
          yPos += 5;
        }
      }
      
      // Add footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`SurveyAI - Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`, 20, 285);
      }
      
      // Save the PDF
      pdf.save(`${results.title.replace(/\s+/g, '_')}_survey_report.pdf`);
      
      toast({
        title: "Export complete",
        description: "Your report has been downloaded.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export failed",
        description: "There was a problem generating your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>No results found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {results.title}: Analytics
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Survey created on {new Date(results.createdAt).toLocaleDateString()} · {results.responses.length} responses
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button
              variant="outline"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Results
            </Button>
            <Button
              className="ml-3 btn-gradient"
              onClick={handleExport}
              disabled={exportingPdf}
            >
              {exportingPdf ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Export Report
                </>
              )}
            </Button>
          </div>
        </div>

        <AIInsights 
          results={results} 
          onGenerateAnalysis={() => analysisMutation.mutate()}
          isGenerating={analysisMutation.isPending}
        />

        <SurveyPredictions results={results} />

        <Charts results={results} />

        <ResponseList responses={results.responses} questions={results.questions} />
      </main>
    </div>
  );
}
