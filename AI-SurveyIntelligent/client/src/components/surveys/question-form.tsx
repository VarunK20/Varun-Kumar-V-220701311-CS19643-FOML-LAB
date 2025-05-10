import { useEffect } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { QuestionType } from "@shared/schema";
import { ArrowUpDown, Copy, Trash2, Plus, X, Asterisk } from "lucide-react";

interface QuestionFormProps {
  form: UseFormReturn<any>;
  index: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function QuestionForm({
  form,
  index,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: QuestionFormProps) {
  // Set up field array for options
  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: `questions.${index}.options`,
  });

  // Get the question type
  const questionType = form.watch(`questions.${index}.type`) as QuestionType;

  // Add default option if necessary
  useEffect(() => {
    if (
      (questionType === "multiple_choice" || questionType === "checkbox") &&
      (!optionFields || optionFields.length === 0)
    ) {
      appendOption("");
    }
  }, [questionType, optionFields, appendOption]);

  return (
    <Card className="p-6">
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <span className="bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full text-xs font-medium mr-2">
            Q{index + 1}
          </span>
          <FormField
            control={form.control}
            name={`questions.${index}.type`}
            render={({ field }) => (
              <FormItem>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    
                    // Clear options when switching to text or rating
                    if (value === "text" || value === "rating") {
                      form.setValue(`questions.${index}.options`, []);
                    }
                    
                    // Add default option when switching to multiple_choice or checkbox
                    if ((value === "multiple_choice" || value === "checkbox") && 
                        (!optionFields || optionFields.length === 0)) {
                      appendOption("");
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-32 h-7 text-xs">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="w-8 h-8 p-0"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              // Clone question at given index
              const currentQuestion = form.getValues(`questions.${index}`);
              form.setValue(`questions.${form.getValues("questions").length}`, {
                ...currentQuestion,
                order: form.getValues("questions").length,
              });
            }}
            className="w-8 h-8 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <FormField
          control={form.control}
          name={`questions.${index}.text`}
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormControl>
                  <Input 
                    placeholder="Enter question text..." 
                    {...field} 
                    className="text-base"
                  />
                </FormControl>
                {form.watch(`questions.${index}.required`) && (
                  <Asterisk className="h-3 w-3 ml-2 text-red-500 flex-shrink-0" />
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-center space-x-2 mt-2">
          <FormField
            control={form.control}
            name={`questions.${index}.required`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-0.5">
                  <FormLabel className="text-xs">
                    Required question
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Show options for multiple choice and checkbox */}
      {(questionType === "multiple_choice" || questionType === "checkbox") && (
        <div className="space-y-2">
          {optionFields.map((option, optionIndex) => (
            <div key={option.id} className="flex items-center">
              <div className="mr-2 flex-shrink-0">
                {questionType === "multiple_choice" ? (
                  <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                ) : (
                  <div className="w-4 h-4 rounded border border-gray-300"></div>
                )}
              </div>
              <FormField
                control={form.control}
                name={`questions.${index}.options.${optionIndex}`}
                render={({ field }) => (
                  <FormItem className="flex-1 flex items-center">
                    <FormControl>
                      <Input 
                        placeholder={`Option ${optionIndex + 1}`} 
                        {...field} 
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(optionIndex)}
                      disabled={optionFields.length <= 1}
                      className="ml-2 w-8 h-8 p-0 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => appendOption("")}
            className="mt-2 text-primary-600 hover:text-primary-500"
          >
            <Plus className="mr-1 h-4 w-4" /> Add Option
          </Button>
        </div>
      )}

      {/* Preview area for text and rating questions */}
      {questionType === "text" && (
        <div className="space-y-2">
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-gray-500">Text input field will appear here</p>
          </div>
        </div>
      )}

      {questionType === "rating" && (
        <div className="space-y-2">
          <div className="flex justify-center space-x-4 py-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <div
                key={rating}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700"
              >
                {rating}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden order field */}
      <FormField
        control={form.control}
        name={`questions.${index}.order`}
        render={({ field }) => (
          <input type="hidden" {...field} value={index} />
        )}
      />
    </Card>
  );
}
