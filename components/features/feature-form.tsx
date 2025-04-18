"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
});

type FeatureFormProps = {
  featureId?: string;
};

export function FeatureForm({ featureId }: FeatureFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!featureId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // Fetch feature data if editing
  useEffect(() => {
    if (featureId) {
      fetchFeature();
    }
  }, [featureId]);

  async function fetchFeature() {
    setInitialLoading(true);
    try {
      const response = await fetch(`/api/features/${featureId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch feature");
      }
      
      const feature = await response.json();
      form.reset({
        name: feature.name,
      });
    } catch (error) {
      console.error("Error fetching feature:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch feature",
        variant: "destructive",
      });
      router.push("/dashboard/features");
    } finally {
      setInitialLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      const url = featureId 
        ? `/api/features/${featureId}` 
        : "/api/features";
      
      const method = featureId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to save feature");
      }
      
      toast({
        title: "Success",
        description: featureId 
          ? "Feature updated successfully" 
          : "Feature created successfully",
      });
      
      router.push("/dashboard/features");
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save feature",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feature Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter feature name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/dashboard/features")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {featureId ? "Update Feature" : "Add Feature"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}