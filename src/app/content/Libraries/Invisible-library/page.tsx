"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

import { Atom } from "react-loading-indicators";
import ShepherdTour from "../../Onboarding/Competency-Management/ShepherdTour";
import { generateDetailTourSteps } from "../../../../lib/tourSteps";

import {
  Eye,
  Lightbulb,
  Target,
  BookOpen,
  Brain,
  Puzzle,
  TrendingUp,
  FileCheck,
  Scale,
  MessageSquare,
  GraduationCap,
  Notebook,
  Sparkles,
  Settings
} from "lucide-react";

/* ---------------- TYPES ---------------- */

type InvisibleItem = {
  id: number;
  type: string;
  title: string;
  description: string;
};

interface InvisibleLibraryPageProps {
  showDetailTour?: boolean | { show: boolean; onComplete?: () => void };
}

/* ---------------- ANIMATION VARIANTS ---------------- */

const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const modalInnerVariants = {
  hidden: { opacity: 0, scale: 0.9, filter: "blur(6px)" },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.25, ease: "easeOut" }
  },
  exit: { opacity: 0, scale: 0.95 }
};

/* ---------------- COMPONENT ---------------- */

export default function InvisibleLibraryPage({ showDetailTour }: InvisibleLibraryPageProps) {
  const [data, setData] = useState<InvisibleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
    orgType: "",
    userId: ""
  });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InvisibleItem | null>(null);

  // Detail tour state
  const [showTour, setShowTour] = useState(false);

  const safeArray = (d: any) =>
    Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];

  /* ---------------- LOAD SESSION DATA ---------------- */

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id, org_type, user_id } =
        JSON.parse(userData);

      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
        orgType: org_type,
        userId: user_id
      });
    }
  }, []);

  /* ---------------- FETCH DATA FUNCTION ---------------- */

  const fetchData = useCallback(async () => {
    if (!sessionData.url) return;
    try {
      setLoading(true);

      const response = await fetch(
        `${sessionData.url}/table_data?table=s_invisible_library`,
        {
          headers: { Authorization: `Bearer ${sessionData.token}` }
        }
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      setData(safeArray(result));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [sessionData.url, sessionData.token]);

  /* --------------- TRIGGER FETCH WHEN READY ---------------- */

  useEffect(() => {
    if (sessionData.url && sessionData.token) fetchData();
  }, [sessionData.url, sessionData.token, fetchData]);

  useEffect(() => {
    const shouldShow = typeof showDetailTour === 'object' ? showDetailTour.show : showDetailTour;
    if (shouldShow) {
      setShowTour(true);
    }
  }, [showDetailTour]);

  /* ---------------- GROUP BY TYPE ---------------- */

  const groupedData = useMemo(() => {
    return data.reduce((acc, item) => {
      (acc[item.type] = acc[item.type] || []).push(item);
      return acc;
    }, {} as Record<string, InvisibleItem[]>);
  }, [data]);

  const types = Object.keys(groupedData);

  /* ---------------- MODAL HANDLERS ---------------- */

  const openItemModal = (item: InvisibleItem) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedItem(null), 200);
  };

  /* ---------------- RENDER ---------------- */

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Atom color="#525ceaff" size="medium" />
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{error}</p>
      </div>
    );

  if (!types.length)
    return (
      <div className="flex justify-center mt-24">
        <p>No data available</p>
      </div>
    );

  return (
    <motion.div variants={pageVariants as any} initial="hidden" animate="show" className="p-6">
      <Tabs defaultValue={types[0]} className="w-full">
        <TabsList className="flex w-full flex-wrap justify-center gap-3 mb-6 bg-transparent">
          {types.map((type) => (
            <TabsTrigger
              key={type}
              value={type}
              className="capitalize px-4 py-2 rounded-md border bg-white
              data-[state=active]:bg-primary data-[state=active]:text-white transition"
            >
              {type}
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          {types.map((type) => (
            <TabsContent key={type} value={type}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <motion.div
                  variants={gridContainerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {groupedData[type].map((item) => (
                    <motion.div
                      key={item.id}
                      variants={cardVariants as any}
                      whileHover={{ y: -8, scale: 1.02 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
                        
                        {/* HEADER WITH DIVIDER + flex-grow */}
                        <CardHeader className="space-y-2 flex-grow">
                          <motion.div layoutId={`title-${item.id}`}>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                          </motion.div>

                          <div className="w-full h-px bg-gray-300"></div>

                          <CardDescription className="text-sm text-gray-600">
                            {item.description}
                          </CardDescription>
                        </CardHeader>

                        {/* FOOTER FIXED AT BOTTOM */}
                        <div className="flex justify-between items-center p-4 pt-0">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-primary/80 flex items-center justify-center">
                              {getTypeIcon(item.type)}
                            </div>
                            <span className="text-xs text-gray-500 capitalize">
                              {item.type}
                            </span>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.15, rotate: 3 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-md border hover:bg-gray-100"
                            onClick={() => openItemModal(item)}
                          >
                            <Eye className="w-5 h-5 text-gray-700" />
                          </motion.button>
                        </div>

                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </TabsContent>
          ))}
        </AnimatePresence>
      </Tabs>

      {/* ---------------- MODAL ---------------- */}
      <Dialog open={isOpen} onOpenChange={(open) => (!open ? closeModal() : null)}>
        <AnimatePresence>
          {isOpen && selectedItem && (
            <DialogContent>
              <motion.div
                variants={modalInnerVariants as any}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <DialogHeader>
                  <motion.div layoutId={`title-${selectedItem.id}`}>
                    <DialogTitle>{selectedItem.title}</DialogTitle>
                  </motion.div>

                  <DialogDescription className="text-gray-500 capitalize">
                    Type: {selectedItem.type}
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 text-gray-700 whitespace-pre-line">
                  {selectedItem.description}
                </div>
              </motion.div>
            </DialogContent>
          )}
        </AnimatePresence>
      </Dialog>

      {/* Detail Tour */}
      {showTour && (
        <ShepherdTour
          steps={generateDetailTourSteps('Invisible')}
          onComplete={() => {
            setShowTour(false);
            if (typeof showDetailTour === 'object' && showDetailTour.onComplete) {
              showDetailTour.onComplete();
            }
          }}
        />
      )}
    </motion.div>
  );
}

/* ---------------- ICON SELECTOR ---------------- */

function getTypeIcon(type: string) {
  const props = { className: "w-5 h-5 text-white" };

  switch (type?.toLowerCase()) {
    case "frameworks":
      return <Puzzle {...props} />;
    case "methodology":
      return <Target {...props} />;
    case "technique":
      return <Lightbulb {...props} />;
    case "strategy":
      return <TrendingUp {...props} />;
    case "mental models":
      return <Brain {...props} />;
    case "approach":
      return <BookOpen {...props} />;
    case "system":
      return <Settings {...props} />;
    case "process":
      return <FileCheck {...props} />;
    case "tool":
      return <MessageSquare {...props} />;
    case "concept":
      return <GraduationCap {...props} />;
    case "principle":
      return <Scale {...props} />;
    case "practice":
      return <Notebook {...props} />;
    default:
      return <Sparkles {...props} />;
  }
}
