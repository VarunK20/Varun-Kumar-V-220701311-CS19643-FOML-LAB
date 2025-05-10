import { useState } from "react";
import { Response, Question, Answer } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { User, Clock } from "lucide-react";

interface ResponseListProps {
  responses: Response[];
  questions: Question[];
}

export function ResponseList({ responses, questions }: ResponseListProps) {
  const [filter, setFilter] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const responsesPerPage = 10;
  
  if (responses.length === 0) {
    return (
      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <CardHeader>
          <CardTitle>Individual Responses</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No responses have been submitted yet.</p>
        </CardContent>
      </div>
    );
  }

  // Apply filter
  let filteredResponses = [...responses];
  switch (filter) {
    case "latest":
      filteredResponses.sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      break;
    case "oldest":
      filteredResponses.sort((a, b) => 
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      );
      break;
    // Add more filters as needed
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredResponses.length / responsesPerPage);
  const indexOfLastResponse = currentPage * responsesPerPage;
  const indexOfFirstResponse = indexOfLastResponse - responsesPerPage;
  const currentResponses = filteredResponses.slice(indexOfFirstResponse, indexOfLastResponse);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Individual Responses
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Browse through all submitted survey responses.
          </p>
        </div>
        <div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter responses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {currentResponses.map((response) => (
            <ResponseItem 
              key={response.id} 
              response={response} 
              questions={questions} 
            />
          ))}
        </ul>
      </div>
      
      {totalPages > 1 && (
        <CardFooter className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstResponse + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastResponse, responses.length)}
                </span>{" "}
                of <span className="font-medium">{responses.length}</span> results
              </p>
            </div>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) paginate(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        paginate(pageNumber);
                      }}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <PaginationItem>
                    <PaginationLink href="#" onClick={(e) => e.preventDefault()}>
                      ...
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        paginate(totalPages);
                      }}
                      isActive={currentPage === totalPages}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) paginate(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </div>
        </CardFooter>
      )}
    </div>
  );
}

interface ResponseItemProps {
  response: Response & { answers: Answer[] };
  questions: Question[];
}

function ResponseItem({ response, questions }: ResponseItemProps) {
  // Find if this response has an answer to a multiple choice satisfaction question
  // This is a simple heuristic to determine satisfaction level for display purposes
  const satisfactionQuestion = questions.find(q => 
    q.type === "multiple_choice" && 
    q.text.toLowerCase().includes("satisf") && 
    q.options?.some(o => 
      o.toLowerCase().includes("satisf") || 
      o.toLowerCase().includes("dissatisf")
    )
  );
  
  const satisfactionAnswer = satisfactionQuestion 
    ? response.answers.find(a => a.questionId === satisfactionQuestion.id)
    : null;
  
  let satisfactionLevel = "";
  let satisfactionColor = "";
  
  if (satisfactionAnswer && satisfactionQuestion?.options) {
    const answerValue = satisfactionAnswer.value as string;
    if (answerValue.toLowerCase().includes("very satisf")) {
      satisfactionLevel = "Very satisfied";
      satisfactionColor = "bg-green-100 text-green-800";
    } else if (answerValue.toLowerCase().includes("satisf")) {
      satisfactionLevel = "Satisfied";
      satisfactionColor = "bg-green-100 text-green-800";
    } else if (answerValue.toLowerCase().includes("neutral")) {
      satisfactionLevel = "Neutral";
      satisfactionColor = "bg-yellow-100 text-yellow-800";
    } else if (answerValue.toLowerCase().includes("very dissatisf")) {
      satisfactionLevel = "Very dissatisfied";
      satisfactionColor = "bg-red-100 text-red-800";
    } else if (answerValue.toLowerCase().includes("dissatisf")) {
      satisfactionLevel = "Dissatisfied";
      satisfactionColor = "bg-red-100 text-red-800";
    } else {
      satisfactionLevel = answerValue;
      satisfactionColor = "bg-gray-100 text-gray-800";
    }
  }

  return (
    <li className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-primary-600 truncate">
          Response #{response.id}
        </div>
        {satisfactionLevel && (
          <div className="ml-2 flex-shrink-0 flex">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${satisfactionColor}`}>
              {satisfactionLevel}
            </span>
          </div>
        )}
      </div>
      <div className="mt-2 sm:flex sm:justify-between">
        <div className="sm:flex">
          <p className="flex items-center text-sm text-gray-500">
            <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            {response.userId ? `User #${response.userId}` : "Anonymous"}
          </p>
        </div>
        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
          <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
          <p>
            Submitted on{" "}
            <time dateTime={new Date(response.submittedAt).toISOString()}>
              {new Date(response.submittedAt).toLocaleDateString()}
            </time>
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {questions.map((question) => {
          const answer = response.answers.find(a => a.questionId === question.id);
          if (!answer) return null;

          let displayValue: string;
          
          if (question.type === "checkbox" && Array.isArray(answer.value)) {
            displayValue = answer.value.join(", ");
          } else if (question.type === "rating") {
            displayValue = `${answer.value}/5`;
          } else {
            displayValue = String(answer.value);
          }

          return (
            <div key={question.id}>
              <div className="text-sm font-medium text-gray-900">
                {question.text}
              </div>
              <div className="mt-1 text-sm text-gray-700">
                {displayValue}
              </div>
            </div>
          );
        })}
      </div>
    </li>
  );
}
