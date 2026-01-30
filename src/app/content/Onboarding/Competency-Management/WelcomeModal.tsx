"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Play } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onStartTour,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] rounded-2xl p-0 overflow-hidden transition-all duration-500">
        
        {/* Top Section */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-400 px-6 py-8 text-white">
          <h2 className="text-xl font-semibold">
            Welcome to HP Frontend 👋
          </h2>
          <p className="mt-1 text-sm text-blue-100">
            Let’s quickly walk through the main features of the application.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          <p className="text-sm text-gray-700">
            This short guided tour will help you feel confident navigating the HP Frontend application.
          </p>

          {/* Journey Steps */}
          <div className="space-y-3">
            {[
              "Explore the main dashboard and key metrics",
              "Navigate through HRMS, LMS, and competency modules",
              "Access libraries for skills, job roles, and reports",
            ].map((text, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5" />
                <span className="text-sm text-gray-800">{text}</span>
              </div>
            ))}
          </div>

          {/* Action */}
          <div className="pt-4 space-y-3">
            <Button
              onClick={onStartTour}
              className="w-full bg-blue-400 hover:bg-blue-500 text-white gap-2"
            >
              <Play className="h-4 w-4" />
              {/* Start 2-Minute Tour */}
              Get Started
            </Button>

            <button
              onClick={onClose}
              className="w-full text-xs text-gray-500 hover:text-gray-700 transition"
            >
              I’ll explore on my own
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
