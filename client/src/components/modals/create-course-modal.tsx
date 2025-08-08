import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";

const createCourseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a valid number",
  }),
  categoryId: z.string().min(1, "Category is required"),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

type CreateCourseFormData = z.infer<typeof createCourseSchema>;

interface CreateCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCourseModal({ open, onOpenChange }: CreateCourseModalProps) {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      categoryId: "",
      difficultyLevel: "beginner",
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: CreateCourseFormData & { thumbnailUrl?: string }) => {
      return await apiRequest("POST", "/api/courses", {
        ...data,
        price: Number(data.price),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      handleClose();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload thumbnail mutation
  const uploadThumbnailMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("thumbnail", file);
      
      const response = await fetch("/api/upload/thumbnail", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to upload thumbnail");
      }

      return await response.json();
    },
  });

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleClose = () => {
    form.reset();
    setThumbnailFile(null);
    setThumbnailPreview(null);
    onOpenChange(false);
  };

  const onSubmit = async (data: CreateCourseFormData) => {
    try {
      let thumbnailUrl: string | undefined;

      // Upload thumbnail if provided
      if (thumbnailFile) {
        const uploadResult = await uploadThumbnailMutation.mutateAsync(thumbnailFile);
        thumbnailUrl = uploadResult.url;
      }

      // Create course
      await createCourseMutation.mutateAsync({
        ...data,
        thumbnailUrl,
      });
    } catch (error) {
      // Error handling is done in the mutation onError
    }
  };

  const isLoading = createCourseMutation.isPending || uploadThumbnailMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Fill in the details to create your new course. You can always edit these later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter course title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what students will learn..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficultyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Course Thumbnail
              </label>
              {thumbnailPreview ? (
                <div className="relative inline-block">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-32 h-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1 hover:bg-error/80"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
                  <p className="text-neutral-400 mb-2">
                    Upload course thumbnail (16:9 ratio recommended)
                  </p>
                  <label className="cursor-pointer">
                    <span className="text-primary hover:text-primary-dark font-medium">
                      Choose File
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-neutral-200">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Course
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
