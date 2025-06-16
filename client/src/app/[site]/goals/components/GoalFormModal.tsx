"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, MousePointerClick } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCreateGoal } from "../../../../api/analytics/goals/useCreateGoal";
import { Goal } from "../../../../api/analytics/goals/useGetGoals";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../components/ui/form";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Switch } from "../../../../components/ui/switch";
import { cn } from "../../../../lib/utils";
import { useUpdateGoal } from "../../../../api/analytics/goals/useUpdateGoal";

// Define form schema
const formSchema = z
  .object({
    name: z.string().optional(),
    goalType: z.enum(["path", "event"]),
    config: z.object({
      pathPattern: z.string().optional(),
      eventName: z.string().optional(),
      eventPropertyKey: z.string().optional(),
      eventPropertyValue: z.string().optional(),
    }),
  })
  .refine(
    (data) => {
      if (data.goalType === "path") {
        return !!data.config.pathPattern;
      } else if (data.goalType === "event") {
        return !!data.config.eventName;
      }
      return false;
    },
    {
      message: "Configuration is required based on goal type",
      path: ["config"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

interface GoalFormModalProps {
  siteId: number;
  goal?: Goal; // Optional goal for editing mode
  trigger: React.ReactNode;
}

export default function GoalFormModal({
  siteId,
  goal,
  trigger,
}: GoalFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [useProperties, setUseProperties] = useState(
    !!goal?.config.eventPropertyKey && !!goal?.config.eventPropertyValue
  );

  // Reinitialize useProperties when goal changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setUseProperties(
        !!goal?.config.eventPropertyKey && !!goal?.config.eventPropertyValue
      );
    }
  }, [isOpen, goal?.config.eventPropertyKey, goal?.config.eventPropertyValue]);

  const onClose = () => {
    setIsOpen(false);
  };

  const isEditMode = !!goal;
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();

  // Initialize form with default values or existing goal
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode
      ? {
          name: goal.name || "",
          goalType: goal.goalType,
          config: {
            pathPattern: goal.config.pathPattern || "",
            eventName: goal.config.eventName || "",
            eventPropertyKey: goal.config.eventPropertyKey || "",
            eventPropertyValue:
              goal.config.eventPropertyValue !== undefined
                ? String(goal.config.eventPropertyValue)
                : "",
          },
        }
      : {
          name: "",
          goalType: "path",
          config: {
            pathPattern: "",
            eventName: "",
            eventPropertyKey: "",
            eventPropertyValue: "",
          },
        },
  });

  const goalType = form.watch("goalType");

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      // Clean up the config based on goal type
      if (values.goalType === "path") {
        values.config.eventName = undefined;
        values.config.eventPropertyKey = undefined;
        values.config.eventPropertyValue = undefined;
      } else if (values.goalType === "event") {
        values.config.pathPattern = undefined;

        // If not using properties, clear them
        if (!useProperties) {
          values.config.eventPropertyKey = undefined;
          values.config.eventPropertyValue = undefined;
        }
      }

      if (isEditMode) {
        await updateGoal.mutateAsync({
          goalId: goal.goalId,
          siteId,
          name: values.name,
          goalType: values.goalType,
          config: values.config,
        });
      } else {
        await createGoal.mutateAsync({
          siteId,
          name: values.name,
          goalType: values.goalType,
          config: values.config,
        });
      }

      // Reset form and state after successful submission
      form.reset();
      setUseProperties(false);

      setIsOpen(false);
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          form.reset();
          setUseProperties(false);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Goal" : "Create Goal"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the goal details below."
              : "Set up a new conversion goal to track specific user actions."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Sign Up Completion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goalType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Type</FormLabel>
                  {isEditMode ? (
                    <div className="flex items-center gap-2 mt-1">
                      {field.value === "path" ? (
                        <div className="flex items-center gap-1 bg-neutral-800/50 py-2 px-3 rounded">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span>Page Goal</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-neutral-800/50 py-2 px-3 rounded">
                          <MousePointerClick className="w-4 h-4 text-amber-500" />
                          <span>Event Goal</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <FormControl>
                      <div className="flex gap-3 mt-1">
                        <Button
                          type="button"
                          variant={
                            field.value === "path" ? "default" : "outline"
                          }
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2",
                            field.value === "path" && "border-blue-500"
                          )}
                          onClick={() => field.onChange("path")}
                        >
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span>Page Goal</span>
                        </Button>
                        <Button
                          type="button"
                          variant={
                            field.value === "event" ? "default" : "outline"
                          }
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2",
                            field.value === "event" && "border-amber-500"
                          )}
                          onClick={() => field.onChange("event")}
                        >
                          <MousePointerClick className="w-4 h-4 text-amber-500" />
                          <span>Event Goal</span>
                        </Button>
                      </div>
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {goalType === "path" && (
              <FormField
                control={form.control}
                name="config.pathPattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Path Pattern</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="/checkout/complete or /product/*/view"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-gray-500 mt-1">
                      Use * to match a single path segment. Use ** to match
                      across segments.
                    </div>
                  </FormItem>
                )}
              />
            )}

            {goalType === "event" && (
              <>
                <FormField
                  control={form.control}
                  name="config.eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., sign_up_completed"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch
                      id="use-properties"
                      checked={useProperties}
                      onCheckedChange={setUseProperties}
                    />
                    <Label htmlFor="use-properties">
                      Match specific event property
                    </Label>
                  </div>

                  {useProperties && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="config.eventPropertyKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Key</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., plan_type" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="config.eventPropertyValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Value</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., premium" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createGoal.isPending || updateGoal.isPending}
                variant="success"
              >
                {createGoal.isPending || updateGoal.isPending
                  ? "Saving..."
                  : isEditMode
                  ? "Update"
                  : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
