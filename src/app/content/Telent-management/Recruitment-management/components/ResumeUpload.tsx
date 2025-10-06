"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Download,
  Eye
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  status: 'uploading' | 'parsing' | 'completed' | 'error';
  progress: number;
  parsedData?: {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experience: string;
    education: string;
    score: number;
  };
}

const ResumeUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const mockParsedData = {
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    skills: ["React", "Node.js", "TypeScript", "AWS", "MongoDB"],
    experience: "5+ years",
    education: "BS Computer Science",
    score: 85
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      const uploadFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.name.split('.').pop()?.toUpperCase() || 'Unknown',
        status: 'uploading',
        progress: 0
      };

      setUploadedFiles(prev => [...prev, uploadFile]);

      // Simulate upload and parsing process
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, status: 'parsing', progress: 0 }
                : f
            )
          );

          // Simulate parsing
          setTimeout(() => {
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === uploadFile.id 
                  ? { ...f, status: 'completed', progress: 100, parsedData: mockParsedData }
                  : f
              )
            );
          }, 2000);
        } else {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, progress }
                : f
            )
          );
        }
      }, 200);
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'parsing':
        return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return "Uploading...";
      case 'parsing':
        return "Parsing resume...";
      case 'completed':
        return "Ready for review";
      case 'error':
        return "Upload failed";
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-success text-success-foreground">Excellent Match</Badge>;
    if (score >= 60) return <Badge className="bg-warning text-warning-foreground">Good Match</Badge>;
    return <Badge variant="outline">Fair Match</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
              handleFileUpload(e.dataTransfer.files);
            }}
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drop your resume here</h3>
            <p className="text-muted-foreground mb-4">
              or click to browse files (PDF, DOCX, TXT supported)
            </p>
            <Button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.docx,.txt';
                input.multiple = true;
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  handleFileUpload(target.files);
                };
                input.click();
              }}
            >
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Resumes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{file.size}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">{file.type}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(file.status)}
                      <span className="text-sm text-muted-foreground">
                        {getStatusText(file.status)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {(file.status === 'uploading' || file.status === 'parsing') && (
                    <Progress value={file.progress} className="mb-3" />
                  )}

                  {file.status === 'completed' && file.parsedData && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{file.parsedData.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {file.parsedData.email} • {file.parsedData.phone}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary mb-1">
                            {file.parsedData.score}%
                          </div>
                          {getScoreBadge(file.parsedData.score)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Experience</h5>
                          <p className="text-sm text-muted-foreground">{file.parsedData.experience}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-2">Education</h5>
                          <p className="text-sm text-muted-foreground">{file.parsedData.education}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-medium text-sm mb-2">Key Skills</h5>
                        <div className="flex flex-wrap gap-2">
                          {file.parsedData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Full Profile
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResumeUpload;