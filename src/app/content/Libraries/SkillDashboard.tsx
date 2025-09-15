"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Users, Star, CheckCircle, AlertTriangle } from "lucide-react";

export default function SkillsDashboard() {
  // Radar Chart Data
  const radarData = [
    { subject: "SQL", required: 80, current: 65 },
    { subject: "Python", required: 85, current: 70 },
    { subject: "Data Analysis", required: 90, current: 60 },
    { subject: "Communication", required: 70, current: 80 },
    { subject: "Leadership", required: 85, current: 60 },
    { subject: "Project Mgmt", required: 80, current: 70 },
    { subject: "Problem Solving", required: 85, current: 75 },
    { subject: "Teamwork", required: 75, current: 80 },
  ];

  // Pie Chart Data
  const teamSkillDist = [
    { name: "Beginner (1-2)", value: 10, color: "#FF8042" },
    { name: "Intermediate (3-4)", value: 40, color: "#00C49F" },
    { name: "Advanced (5-6)", value: 35, color: "#0088FE" },
    { name: "Expert (7+)", value: 15, color: "#FFBB28" },
  ];

  // Bar Chart Data
  const compCompletion = [
    { name: "Communication", value: 90 },
    { name: "Leadership", value: 65 },
    { name: "Technical", value: 85 },
    { name: "Problem Solving", value: 70 },
  ];

  // Top Performers
  const topPerformers = [
    { id: 1, name: "Alice Johnson", score: 6.8 },
    { id: 2, name: "John Doe", score: 6.2 },
    { id: 3, name: "Michael Chen", score: 5.9 },
    { id: 4, name: "Sarah Wilson", score: 5.7 },
    { id: 5, name: "David Brown", score: 5.4 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <Users className="text-blue-500 mb-2" />
            <p className="text-lg font-semibold">127</p>
            <p className="text-sm text-gray-600">Total Employees</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <Star className="text-green-500 mb-2" />
            <p className="text-lg font-semibold">4.8</p>
            <p className="text-sm text-gray-600">Avg Skill Rating</p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <CheckCircle className="text-indigo-500 mb-2" />
            <p className="text-lg font-semibold">89%</p>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <AlertTriangle className="text-yellow-500 mb-2" />
            <p className="text-lg font-semibold">23</p>
            <p className="text-sm text-gray-600">Skills to Improve</p>
          </CardContent>
        </Card>
      </div>

      {/* Skills Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Gap Analysis - Required vs Current</CardTitle>
          <p className="text-sm text-gray-500">
            Strategic overview comparing required skill levels against current team capabilities
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <Radar name="Required Skills" dataKey="required" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="Current Skills" dataKey="current" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>

          {/* Gap Analysis Summary */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-3 rounded bg-green-50 border border-green-200">
              <p className="font-semibold">Exceeding Expectations</p>
              <p className="text-sm text-gray-600">Communication (+5%)</p>
              <p className="text-sm text-gray-600">Teamwork (+5%)</p>
            </div>
            <div className="p-3 rounded bg-yellow-50 border border-yellow-200">
              <p className="font-semibold">Minor Gaps</p>
              <p className="text-sm text-gray-600">SQL (-15%)</p>
              <p className="text-sm text-gray-600">Python (-15%)</p>
              <p className="text-sm text-gray-600">Project Mgmt (-15%)</p>
              <p className="text-sm text-gray-600">Problem Solving (-12%)</p>
            </div>
            <div className="p-3 rounded bg-red-50 border border-red-200">
              <p className="font-semibold">Critical Gaps</p>
              <p className="text-sm text-gray-600">Data Analysis (-25%)</p>
              <p className="text-sm text-gray-600">Leadership (-25%)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-2 gap-4">
        {/* Team Skill Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Team Skill Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={teamSkillDist}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {teamSkillDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Competency Completion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Competency Completion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={compCompletion}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {topPerformers.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center py-2"
              >
                <span className="font-medium">
                  {p.id}. {p.name}
                </span>
                <span className="text-blue-600 font-semibold">
                  {p.score} avg
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
