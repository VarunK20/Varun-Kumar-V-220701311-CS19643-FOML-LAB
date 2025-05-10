import { useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { QuestionForm } from "./question-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Plus, ArrowUpDown, Copy, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { questionTypes } from "@shared/schema";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Define the form value types
type SurveyFormValues = {
  title: string;
  description?: string;
  isPublic: boolean;
  startDate: Date;
  endDate?: Date | null;
  questions: {
    text: string;
    type: typeof questionTypes[number];
    options?: string[] | null;
    order: number;
    required: boolean;
  }[];
};

interface SurveyFormProps {
  form: UseFormReturn<SurveyFormValues>;
  questions: any[];
  addQuestion: () => void;
  removeQuestion: (index: number) => void;
  moveQuestion: (from: number, to: number) => void;
  onSubmit: (data: SurveyFormValues) => void;
  isPending: boolean;
}

export function SurveyForm({
  form,
  questions,
  addQuestion,
  removeQuestion,
  moveQuestion,
  onSubmit,
  isPending,
}: SurveyFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid grid-cols-1 gap-6">
        {/* Survey Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Survey Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Survey Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter survey title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter survey description..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Public Survey
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Make this survey visible to everyone
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Survey Questions</CardTitle>
            <Button
              type="button"
              onClick={addQuestion}
              size="sm"
            >
              <Plus className="-ml-1 mr-2 h-4 w-4" /> Add Question
            </Button>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-4">
                  No questions added yet. Click the button above to add your first question.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((field, index) => (
                  <QuestionForm
                    key={field.id}
                    form={form}
                    index={index}
                    onRemove={() => removeQuestion(index)}
                    onMoveUp={() => moveQuestion(index, index - 1)}
                    onMoveDown={() => moveQuestion(index, index + 1)}
                    canMoveUp={index > 0}
                    canMoveDown={index < questions.length - 1}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
