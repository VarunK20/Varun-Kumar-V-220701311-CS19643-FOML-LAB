import { useState, useMemo } from "react";
import { SurveyResults, Question, Answer } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface ChartsProps {
  results: SurveyResults;
}

export function Charts({ results }: ChartsProps) {
  // No responses scenario
  if (results.responses.length === 0) {
    return (
      <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              There are no responses yet to generate charts.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-gray-500">Charts will appear here once you have survey responses.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract questions that can be visualized (multiple choice, checkbox, rating)
  const visualizableQuestions = results.questions.filter(
    q => q.type === "multiple_choice" || q.type === "checkbox" || q.type === "rating"
  );

  // If there are no visualizable questions
  if (visualizableQuestions.length === 0) {
    return (
      <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>No Charts Available</CardTitle>
            <CardDescription>
              This survey doesn't contain questions that can be visualized as charts.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-gray-500">Add multiple choice, checkbox, or rating questions to see charts.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Display all visualizable questions
  return (
    <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
      {visualizableQuestions.map(question => (
        <QuestionChart 
          key={question.id} 
          question={question} 
          responses={results.responses} 
        />
      ))}
    </div>
  );
}

interface QuestionChartProps {
  question: Question;
  responses: SurveyResults['responses'];
}

function QuestionChart({ question, responses }: QuestionChartProps) {
  // Get all answers for this question
  const answers = responses.flatMap(r => 
    r.answers.filter(a => a.questionId === question.id)
  );

  const chartData = useMemo(() => {
    switch (question.type) {
      case 'multiple_choice':
        return processMultipleChoiceData(question, answers);
      case 'checkbox':
        return processCheckboxData(question, answers);
      case 'rating':
        return processRatingData(answers);
      default:
        return [];
    }
  }, [question, answers]);

  if (question.type === 'multiple_choice' || question.type === 'rating') {
    return <PieChartCard question={question} data={chartData} />;
  } else if (question.type === 'checkbox') {
    return <BarChartCard question={question} data={chartData} />;
  }

  return null;
}

function processMultipleChoiceData(question: Question, answers: Answer[]): any[] {
  const options = question.options as string[];
  if (!options || !options.length) return [];

  // Initialize counters for each option
  const counts: Record<string, number> = {};
  options.forEach(option => {
    counts[option] = 0;
  });

  // Count the occurrences of each option
  answers.forEach(answer => {
    const value = answer.value as string;
    if (counts[value] !== undefined) {
      counts[value]++;
    }
  });

  // Convert to chart data format
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value
  }));
}

function processCheckboxData(question: Question, answers: Answer[]): any[] {
  const options = question.options as string[];
  if (!options || !options.length) return [];

  // Initialize counters for each option
  const counts: Record<string, number> = {};
  options.forEach(option => {
    counts[option] = 0;
  });

  // Count the occurrences of each option
  answers.forEach(answer => {
    const selectedOptions = answer.value as string[];
    if (Array.isArray(selectedOptions)) {
      selectedOptions.forEach(option => {
        if (counts[option] !== undefined) {
          counts[option]++;
        }
      });
    }
  });

  // Convert to chart data format
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value
  }));
}

function processRatingData(answers: Answer[]): any[] {
  // Initialize counters for ratings 1-5
  const counts: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };

  // Count the occurrences of each rating
  answers.forEach(answer => {
    const rating = Number(answer.value);
    if (counts[rating] !== undefined) {
      counts[rating]++;
    }
  });

  // Convert to chart data format
  return Object.entries(counts).map(([name, value]) => ({
    name: `Rating ${name}`,
    value
  }));
}

function PieChartCard({ question, data }: { question: Question, data: any[] }) {
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
  const totalResponses = data.reduce((sum, entry) => sum + entry.value, 0);

  // Custom render for pie chart labels to prevent overlap
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    // Only render label for segments with enough percentage (5% or more)
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 0.8;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {question.text}
        </CardTitle>
        <CardDescription>
          {totalResponses} responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} (${((value as number) / totalResponses * 100).toFixed(0)}%)`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No data available for this question.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BarChartCard({ question, data }: { question: Question, data: any[] }) {
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
  const totalResponses = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {question.text}
        </CardTitle>
        <CardDescription>
          {totalResponses} selections across all responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No data available for this question.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
