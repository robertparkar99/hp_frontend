
"use client";
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { FileSpreadsheet, Zap, BookOpen, GraduationCap, FileText, Layers, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { create } from "domain";

interface BulkContentGenerateProps {
  sessionData: {
    url?: string;
    token?: string;
    sub_institute_id?: string;
    user_id?: string;
  };
}

// Excel column mapping for Assessment and Course generation
const COLUMN_MAPPING: Record<string, string> = {
  "Department Name": "department",
  "Department ID": "departmentId",
  "Job ID": "jobId",
  "Job Role": "jobrole",
  "Job Role Category": "jobRoleCategory",
  "Chapter": "chapterName",
  "Topic": "chapterName",
  "Description": "chapter_desc",
  "Content Type": "contentType",
  "Type": "contentType",
  "Question": "question",
  "Questions": "question",
  "Question Text": "question",
  "Slides": "slides",
  "Slide Content": "slides",
  "Slides Content": "slides",
};

// Default values for missing fields
const DEFAULT_VALUES = {
  contentType: "both",
  template: "standard",
  scheduleType: "immediate",
};

// Content type options
const CONTENT_TYPES = [
  { value: "both", label: "Both (Assessment + Course)", icon: Layers },
  { value: "assessment", label: "Assessment Only", icon: GraduationCap },
  { value: "course", label: "Course Only", icon: FileText },
];

export default function BulkContentGenerate({ sessionData }: BulkContentGenerateProps) {
  const [rawExcelData, setRawExcelData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [columnHeaders, setColumnHeaders] = useState<string[]>([]);
  const [generationResults, setGenerationResults] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number } | null>(null);

  // Map Excel data to expected format
  const mappedData = useMemo(() => {
    return rawExcelData.map((row) => {
      const mappedRow: any = { ...DEFAULT_VALUES };
      
      // Map each column from Excel to the expected format
      Object.entries(COLUMN_MAPPING).forEach(([excelColumn, targetField]) => {
        // Try to find the column in the Excel file (case-insensitive)
        const excelKey = Object.keys(row).find(
          (key) => key.toLowerCase().trim() === excelColumn.toLowerCase()
        );
        if (excelKey && row[excelKey] !== undefined && row[excelKey] !== null) {
          let value = row[excelKey];
          
          // Normalize content type
          if (targetField === "contentType") {
            const normalizedValue = String(value).toLowerCase().trim();
            if (normalizedValue.includes("assessment") && normalizedValue.includes("course")) {
              value = "both";
            } else if (normalizedValue.includes("assessment")) {
              value = "assessment";
            } else if (normalizedValue.includes("course") || normalizedValue.includes("ppt") || normalizedValue.includes("slide")) {
              value = "course";
            } else {
              value = "both";
            }
          }
          
          // For question field - check if value is a number (count) or text (content)
          if (targetField === "question") {
            const strValue = String(value || "").trim();
            // Check if it's a number - treat as question count
            const numValue = parseInt(strValue);
            if (!isNaN(numValue) && strValue.match(/^\d+$/)) {
              // It's a number - use as questionCount
              mappedRow.questionCount = numValue;
            
            } else {
              // It's text content - use as question
              mappedRow.question = strValue;
            }
          } else if (targetField === "slides") {
            // For slides field - check if value is a number (count) or text (content)
            const strValue = String(value || "").trim();
            // Check if it's a number - treat as slide count
            const numValue = parseInt(strValue);
            if (!isNaN(numValue) && strValue.match(/^\d+$/)) {
              // It's a number - use as slideCount
              mappedRow.slideCount = numValue;
             
            } else {
              // It's text content - use as slides
              mappedRow.slides = strValue;
            }
          }
          
          // For question and slides fields, we handle them separately above
          // Don't overwrite with the generic assignment below
          if (targetField === "question" || targetField === "slides") {
            // Already handled in the blocks above
          } else {
            mappedRow[targetField] = value;
          }
        }
      });
      
      // Determine contentType based on presence of question or slide content
      // Both question and slides fields can contain either text content or numeric counts
      // We check if they have non-empty values (either text or numbers)
      const hasQuestion = mappedRow.question !== undefined && mappedRow.question !== null && String(mappedRow.question).trim() !== "";
      const hasSlides = mappedRow.slides !== undefined && mappedRow.slides !== null && String(mappedRow.slides).trim() !== "";
      
      // Also check questionCount/slideCount for numeric counts (from Question/Slides columns containing numbers)
      const hasQuestionCount = mappedRow.questionCount && mappedRow.questionCount > 0;
      const hasSlideCount = mappedRow.slideCount && mappedRow.slideCount > 0;
      
      const hasAnyQuestion = hasQuestion || hasQuestionCount;
      const hasAnySlides = hasSlides || hasSlideCount;
      
      if (hasAnyQuestion && hasAnySlides) {
        mappedRow.contentType = "both";
      } else if (hasAnyQuestion && !hasAnySlides) {
        mappedRow.contentType = "assessment";
      } else if (!hasAnyQuestion && hasAnySlides) {
        mappedRow.contentType = "course";
      } else {
        // Neither question nor slides content - set contentType to none
        // Keep the Excel values if they exist, don't override to 0
        mappedRow.contentType = "none";
      }

      // Fallback for chapterName if missing
      mappedRow.chapterName = mappedRow.chapterName || mappedRow.jobrole;

      return mappedRow;
    });
  }, [rawExcelData]);

  // Filter out rows with no question or slide content
  const validRows = useMemo(() => {
    return mappedData.filter(row => row.contentType !== "none");
  }, [mappedData]);

  // =====================
  // EXCEL UPLOAD HANDLER
  // =====================

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      
      if (rows.length > 0) {
        // Get column headers from first row
        const headers = Object.keys(rows[0] as object);
        setColumnHeaders(headers);
      }
      
      setRawExcelData(rows);
    };
    reader.readAsArrayBuffer(file);
  };

  // =====================
  // BULK API CALL
  // =====================

const handleBulkGenerate = async () => {
  if (validRows.length === 0) {
    alert("No valid content to generate.");
    return;
  }

  setIsGenerating(true);
  setGenerationProgress({ current: 0, total: validRows.length });
  setGenerationResults([]);

  try {
    // 1️⃣ Generate Assessment + Course
    const response = await fetch("/api/bulk-content-generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sessionData.token
          ? { Authorization: `Bearer ${sessionData.token}` }
          : {}),
      },
      body: JSON.stringify({
        rows: validRows,
      }),
    });

    if (!response.ok) {
      throw new Error("Generation failed");
    }

    const data = await response.json();
    setGenerationResults(data.results || []);

    // 2️⃣ Store Generated Data to Laravel API
    const storeResponse = await fetch(
      `${sessionData.url}/lms/blukCourseAndQuestion/store`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sessionData.token
            ? { Authorization: `Bearer ${sessionData.token}` }
            : {}),
        },
        body: JSON.stringify({
          rows: validRows,        // Original mapped rows
          previewData: data,      // Full preview response
          sub_institute_id: sessionData.sub_institute_id,
          user_id: sessionData.user_id,
          created_by: sessionData.user_id,


        }),
      }
    );

    if (!storeResponse.ok) {
      throw new Error("Store API failed");
    }

    alert("Bulk generation + store completed successfully ✅");
  } catch (error) {
    console.error("Error:", error);
    alert("Error generating or storing data.");
  } finally {
    setIsGenerating(false);
    setGenerationProgress(null);
  }
};



  const handleClearData = () => {
    setRawExcelData([]);
    setColumnHeaders([]);
    setGenerationResults([]);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
        <FileSpreadsheet className="w-12 h-12 mx-auto text-green-600 mb-3" />

        <p className="font-medium mb-2 text-foreground">
          Upload Excel File
        </p>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleExcelUpload}
          className="mx-auto"
          disabled={isGenerating}
        />

        <p className="text-sm text-muted-foreground mt-2">
          Each row = one content generation (Assessment or Course)
        </p>

        {/* Expected Columns Info */}
        <div className="mt-4 p-4 bg-muted/30 rounded-lg text-left">
          <p className="text-sm font-medium text-foreground mb-2">Expected Excel Columns:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
            <span>• Department Name</span>
            <span>• Job Role</span>
            <span>• Chapter/Topic</span>
            <span>• Content Type</span>
            <span>• Question</span>
            <span>• Slides</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <strong>For Questions:</strong> Enter a number (e.g., 5) for question count, or enter question text for custom content
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <strong>For Slides:</strong> Enter a number (e.g., 10) for slide count, or enter slide content for custom content
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Content Type can be: "assessment", "course", or "both"
          </p>
        </div>
      </div>

      {/* Excel Data Preview */}
      {mappedData.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-foreground">
                Rows detected: {mappedData.length}
                {validRows.length !== mappedData.length && (
                  <span className="text-red-500 ml-2">
                    ({mappedData.length - validRows.length} filtered - no content)
                  </span>
                )}
              </p>
              {isGenerating && generationProgress && (
                <p className="text-sm text-muted-foreground mt-1">
                  Generating: {generationProgress.current} / {generationProgress.total}
                </p>
              )}
            </div>
            <button
              onClick={handleClearData}
              disabled={isGenerating}
              className="text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
            >
              Clear Data
            </button>
          </div>

          {/* Progress Bar */}
          {isGenerating && generationProgress && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(generationProgress.current / generationProgress.total) * 100}%` }}
              />
            </div>
          )}

          {/* Data Table Preview */}
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-2 text-foreground">#</th>
                  <th className="px-3 py-2 text-foreground">Chapter/Topic</th>
                  <th className="px-3 py-2 text-foreground">Department</th>
                  <th className="px-3 py-2 text-foreground">Job Role</th>
                  <th className="px-3 py-2 text-foreground">Content Type</th>
                  <th className="px-3 py-2 text-foreground">Questions</th>
                  <th className="px-3 py-2 text-foreground">Slides</th>
                </tr>
              </thead>
              <tbody>
                {mappedData.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="px-3 py-2 text-foreground">{index + 1}</td>
                    <td className="px-3 py-2 text-foreground">{row.chapterName || "-"}</td>
                    <td className="px-3 py-2 text-foreground">{row.department || "-"}</td>
                    <td className="px-3 py-2 text-foreground">{row.jobrole || "-"}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        row.contentType === 'both' ? 'bg-purple-100 text-purple-800' :
                        row.contentType === 'assessment' ? 'bg-green-100 text-green-800' :
                        row.contentType === 'course' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {row.contentType === 'both' ? 'Both' : row.contentType === 'assessment' ? 'Assessment' : row.contentType === 'course' ? 'Course' : 'None'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-foreground">
                      {row.contentType === 'none' ? (
                        <span className="text-gray-400">0</span>
                      ) : row.question ? (
                        <span className="text-xs text-blue-600" title={String(row.question)}>
                          {String(row.question).length > 30 ? String(row.question).substring(0, 30) + '...' : row.question}
                        </span>
                      ) : row.questionCount ? (
                        <span>{row.questionCount} questions</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-foreground">
                      {row.contentType === 'none' ? (
                        <span className="text-gray-400">0</span>
                      ) : row.slides ? (
                        <span className="text-xs text-green-600" title={String(row.slides)}>
                          {String(row.slides).length > 30 ? String(row.slides).substring(0, 30) + '...' : row.slides}
                        </span>
                      ) : row.slideCount ? (
                        <span>{row.slideCount} slides</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mappedData.length > 10 && (
              <p className="text-sm text-muted-foreground mt-2">
                ...and {mappedData.length - 10} more rows
              </p>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleBulkGenerate}
            disabled={isGenerating}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 w-full justify-center"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Content...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Start Bulk Generation</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Generation Results */}
      {generationResults.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">Generation Results</h3>
          <div className="space-y-2">
            {generationResults.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  result.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-medium text-foreground">
                      Row {result.rowIndex}: {result.topic || result.chapterName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    {result.assessment?.success && (
                      <span className="text-green-600 flex items-center">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        Questions Generated
                      </span>
                    )}
                    {result.course?.success && (
                      <span className="text-blue-600 flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        Course Generated
                      </span>
                    )}
                  </div>
                </div>
                {result.errors && result.errors.length > 0 && (
                  <p className="text-red-500 text-sm mt-2">
                    {result.errors.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
