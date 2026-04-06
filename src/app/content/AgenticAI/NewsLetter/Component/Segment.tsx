"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Users, CheckCircle2 } from "lucide-react";

interface SegmentPageProps {
  onNext: (segment: string) => void;
  initialSegment?: string;
}

const SEGMENT_OPTIONS = [
  { id: "general", name: "General Audience", description: "All subscribers" },
  { id: "premium", name: "Premium Members", description: "Premium tier subscribers" },
  { id: "new_subscribers", name: "New Subscribers", description: "Recently subscribed users" },
  { id: "inactive", name: "Inactive Users", description: "Users inactive for 30+ days" },
];

export default function SegmentPage({ onNext, initialSegment = "" }: SegmentPageProps) {
  const router = useRouter();
  const [selectedSegment, setSelectedSegment] = useState(initialSegment || "");
  const [customSegment, setCustomSegment] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handleContinue = () => {
    const segment = selectedSegment || customSegment;
    if (segment) {
      onNext(segment);
    }
  };

  return (
    <div className=" mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/content/AgenticAI/AgentLibrary")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6" /> Select Segment
          </h1>
          <p className="text-muted-foreground">Choose your target audience for the newsletter</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span>Step 1 of 4</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {SEGMENT_OPTIONS.map((segment) => (
          <Card
            key={segment.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedSegment === segment.id
                ? "border-primary bg-primary/5 ring-2 ring-primary"
                : ""
            }`}
            onClick={() => {
              setSelectedSegment(segment.id);
              setCustomSegment("");
              setShowCustom(false);
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {selectedSegment === segment.id && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
                {segment.name}
              </CardTitle>
              <CardDescription>{segment.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Custom Segment</CardTitle>
          <CardDescription>Enter a custom segment name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter custom segment name"
              value={customSegment}
              onChange={(e) => {
                setCustomSegment(e.target.value);
                setSelectedSegment("");
              }}
              onFocus={() => setShowCustom(true)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={!selectedSegment && !customSegment}
          className="gap-2"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
