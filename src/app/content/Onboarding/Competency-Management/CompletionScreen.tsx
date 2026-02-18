"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface CompletionScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ isOpen, onClose, onComplete }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[660px] sm:max-h-[700px] rounded-2xl p-0 overflow-y-auto transition-all duration-500">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.5 }}
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">Tour Completed!</h1>
            <p className="text-blue-100">You've mastered the Competency Management system</p>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Sparkles className="w-12 h-12 text-yellow-500 mx-auto " />
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                Congratulations!
              </h2>
              <p className="text-gray-600 mb-2 leading-relaxed">
                You've successfully completed the onboarding tour for all competency libraries.
                You're now ready to explore and manage skills, job roles, tasks, knowledge,
                abilities, attitudes, behaviors, and invisible competencies.
              </p>
            </motion.div>

            {/* Key Points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-gray-50 rounded-lg p-4 mb-2"
            >
              <h3 className="font-semibold text-gray-800 mb-2">What you can do now:</h3>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Create and manage skill inventories</li>
                <li>• Define job roles and responsibilities</li>
                <li>• Organize tasks and critical work functions</li>
                <li>• Build knowledge bases</li>
                <li>• Assess abilities and competencies</li>
                <li>• Track attitudes and behaviors</li>
                <li>• Explore invisible competencies</li>
              </ul>
            </motion.div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              Access Competency Workspace
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionScreen;
