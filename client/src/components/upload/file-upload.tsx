import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  CloudUpload, 
  FileVideo, 
  FileText, 
  HelpCircle, 
  ClipboardList,
  FolderOpen,
  X,
  Upload
} from "lucide-react";

interface FileUploadProps {
  courseId: string;
}

export default function FileUpload({ courseId }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materialType, setMaterialType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `/api/courses/${courseId}/materials`);
        xhr.withCredentials = true;
        xhr.send(formData);
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Material uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "materials"] });
      resetForm();
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
        description: "Failed to upload material. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name);
      }
    }
  }, [title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name);
      }
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setMaterialType("");
    setTitle("");
    setUploadProgress(0);
  };

  const handleUpload = () => {
    if (!selectedFile || !materialType) {
      toast({
        title: "Error",
        description: "Please select a file and material type",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("type", materialType);
    formData.append("title", title || selectedFile.name);
    formData.append("orderIndex", "0");

    uploadMutation.mutate(formData);
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'pdf':
        return 'bg-error/10 text-error border-error/20';
      case 'quiz':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'assignment':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Course Materials</CardTitle>
        <CardDescription>
          Upload videos, PDFs, quizzes, and other course resources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drag and Drop Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive 
              ? "border-primary bg-primary/5" 
              : "border-neutral-300 hover:border-primary"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CloudUpload className="text-primary" size={32} />
          </div>
          <h3 className="text-lg font-medium text-neutral-700 mb-2">
            Drop files here or click to browse
          </h3>
          <p className="text-neutral-400 mb-4">
            Supports: MP4, PDF, DOCX, PPTX (Max 100MB per file)
          </p>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <FolderOpen className="mr-2" size={16} />
                Browse Files
              </span>
            </Button>
            <input
              type="file"
              accept=".mp4,.mov,.pdf,.docx,.pptx,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-neutral-700">Selected File</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetForm}
                className="text-neutral-400 hover:text-error"
              >
                <X size={16} />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="font-medium text-neutral-700">{selectedFile.name}</p>
                <p className="text-sm text-neutral-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Material Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter material title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Material Type</Label>
                  <Select value={materialType} onValueChange={setMaterialType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Lecture</SelectItem>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {uploadMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Uploading...</span>
                    <span className="text-sm text-neutral-400">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <Button 
                onClick={handleUpload}
                disabled={!materialType || uploadMutation.isPending}
                className="w-full"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Upload className="mr-2 animate-spin" size={16} />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2" size={16} />
                    Upload Material
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* File Type Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setMaterialType('video')}
            className={`flex flex-col items-center p-4 border-2 rounded-xl transition-colors ${
              materialType === 'video' 
                ? getFileTypeColor('video')
                : 'border-neutral-200 hover:border-primary hover:bg-primary/5'
            }`}
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <FileVideo className="text-primary" size={24} />
            </div>
            <span className="font-medium text-neutral-700">Video Lecture</span>
            <span className="text-sm text-neutral-400">MP4, MOV</span>
          </button>

          <button
            onClick={() => setMaterialType('pdf')}
            className={`flex flex-col items-center p-4 border-2 rounded-xl transition-colors ${
              materialType === 'pdf' 
                ? getFileTypeColor('pdf')
                : 'border-neutral-200 hover:border-primary hover:bg-primary/5'
            }`}
          >
            <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center mb-3">
              <FileText className="text-error" size={24} />
            </div>
            <span className="font-medium text-neutral-700">PDF Document</span>
            <span className="text-sm text-neutral-400">PDF</span>
          </button>

          <button
            onClick={() => setMaterialType('quiz')}
            className={`flex flex-col items-center p-4 border-2 rounded-xl transition-colors ${
              materialType === 'quiz' 
                ? getFileTypeColor('quiz')
                : 'border-neutral-200 hover:border-primary hover:bg-primary/5'
            }`}
          >
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-3">
              <HelpCircle className="text-secondary" size={24} />
            </div>
            <span className="font-medium text-neutral-700">Quiz</span>
            <span className="text-sm text-neutral-400">Interactive</span>
          </button>

          <button
            onClick={() => setMaterialType('assignment')}
            className={`flex flex-col items-center p-4 border-2 rounded-xl transition-colors ${
              materialType === 'assignment' 
                ? getFileTypeColor('assignment')
                : 'border-neutral-200 hover:border-primary hover:bg-primary/5'
            }`}
          >
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-3">
              <ClipboardList className="text-success" size={24} />
            </div>
            <span className="font-medium text-neutral-700">Assignment</span>
            <span className="text-sm text-neutral-400">DOCX, PDF</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
