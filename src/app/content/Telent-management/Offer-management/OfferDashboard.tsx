"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import OfferDetailsDialog from "./OfferDetailsDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText,
  Send,
  Eye,
  Download,
  CheckCircle,
  Clock,
  X,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

interface Offer {
  id: number;
  candidateId: number;
  candidateName: string;
  position: string;
  jobTitle: string;
  salary: string;
  startDate: string;
  status: 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt: string;
  sentAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  offerLetterUrl?: string;
  notes?: string;
}

interface OfferTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
}

// Dummy data for offers
const dummyOffers: Offer[] = [
  {
    id: 1,
    candidateId: 101,
    candidateName: "Sarah Johnson",
    position: "Senior Full-Stack Developer",
    jobTitle: "Senior Full-Stack Developer",
    salary: "₹1,20,000 - ₹1,50,000",
    startDate: "2024-02-15",
    status: "sent",
    createdAt: "2024-01-16",
    expiresAt: "2024-01-30",
    sentAt: "2024-01-16",
    notes: "Competitive offer for experienced developer"
  },
  {
    id: 2,
    candidateId: 102,
    candidateName: "Michael Chen",
    position: "Product Manager",
    jobTitle: "Product Manager",
    salary: "₹1,80,000 - ₹2,20,000",
    startDate: "2024-02-20",
    status: "accepted",
    createdAt: "2024-01-15",
    expiresAt: "2024-01-29",
    sentAt: "2024-01-15",
    acceptedAt: "2024-01-17",
    notes: "Accepted via email, starting next month"
  },
  {
    id: 3,
    candidateId: 104,
    candidateName: "Robert Kim",
    position: "DevOps Engineer",
    jobTitle: "DevOps Engineer",
    salary: "₹1,40,000 - ₹1,70,000",
    startDate: "2024-02-10",
    status: "sent",
    createdAt: "2024-01-14",
    expiresAt: "2024-01-28",
    sentAt: "2024-01-14",
    notes: "High-priority hire, excellent technical skills"
  },
  {
    id: 4,
    candidateId: 103,
    candidateName: "Priya Patel",
    position: "UX Designer",
    jobTitle: "UX Designer",
    salary: "₹90,000 - ₹1,20,000",
    startDate: "2024-02-25",
    status: "rejected",
    createdAt: "2024-01-13",
    expiresAt: "2024-01-27",
    sentAt: "2024-01-13",
    rejectedAt: "2024-01-18",
    notes: "Candidate declined, seeking higher compensation"
  }
];

const dummyTemplates: OfferTemplate[] = [
  {
    id: "standard",
    name: "Standard Employment Offer",
    content: `Dear [Candidate Name],

We are pleased to offer you the position of [Position] at [Company Name]. This offer is contingent upon satisfactory completion of background checks and reference verification.

Position Details:
- Job Title: [Position]
- Start Date: [Start Date]
- Compensation: [Salary]
- Location: [Location]

Benefits:
- Health insurance
- Paid time off
- Professional development allowance

Please review this offer and let us know your decision by [Expiration Date].

Best regards,
HR Team`,
    variables: ["Candidate Name", "Position", "Company Name", "Start Date", "Salary", "Location", "Expiration Date"]
  },
  {
    id: "executive",
    name: "Executive Offer Letter",
    content: `Dear [Candidate Name],

On behalf of [Company Name], I am delighted to extend a formal offer for the position of [Position].

Compensation Package:
- Base Salary: [Salary]
- Signing Bonus: [Signing Bonus]
- Equity Package: [Equity]

Benefits and Perks:
- Comprehensive health coverage
- Unlimited PTO
- Executive development program
- Company vehicle allowance

We believe your leadership and expertise will be invaluable to our team.

Please contact me directly to discuss this opportunity.

Sincerely,
CEO`,
    variables: ["Candidate Name", "Position", "Company Name", "Salary", "Signing Bonus", "Equity"]
  }
];

export default function OfferDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [templates, setTemplates] = useState<OfferTemplate[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'details' | 'contract'>('details');
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [newOffer, setNewOffer] = useState({
    candidateId: '',
    candidateName: '',
    position: '',
    jobTitle: '',
    salary: '',
    startDate: '',
    templateId: 'standard',
    notes: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      setSessionData(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    // Check for query parameters from hiring decision
    const candidate = searchParams.get('candidate');
    const position = searchParams.get('position');

    if (candidate && position) {
      // Pre-fill the form with candidate data
      setNewOffer(prev => ({
        ...prev,
        candidateName: candidate,
        position: position,
        jobTitle: position
      }));
      // Auto-open the create dialog
      setIsCreateDialogOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!sessionData) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Try to fetch real offers data
        const offersResponse = await fetch(
          `${sessionData.APP_URL}/api/offers?type=API&token=${sessionData.token}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (offersResponse.ok) {
          const offersResult = await offersResponse.json();
          setOffers(offersResult.data || dummyOffers);
        } else {
          // Use dummy data when API fails
          setOffers(dummyOffers);
        }

        // Try to fetch templates
        const templatesResponse = await fetch(
          `${sessionData.APP_URL}/api/offer-templates?type=API&token=${sessionData.token}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (templatesResponse.ok) {
          const templatesResult = await templatesResponse.json();
          setTemplates(templatesResult.data || dummyTemplates);
        } else {
          // Use dummy templates
          setTemplates(dummyTemplates);
        }
      } catch (error) {
        console.warn("Using dummy data due to API error:", error);
        setOffers(dummyOffers);
        setTemplates(dummyTemplates);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionData]);

  const createOffer = async () => {
    if (!sessionData) return;

    try {
      const offerData = {
        ...newOffer,
        candidateId: parseInt(newOffer.candidateId),
        createdBy: sessionData.user_id,
        status: 'sent',
        sentAt: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days from now
      };

      const response = await fetch(`${sessionData.APP_URL}/api/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.token}`
        },
        body: JSON.stringify(offerData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Offer created successfully!');

        // Add to local state
        const newOfferWithId: Offer = {
          ...offerData,
          id: result.data?.id || Date.now(),
          createdAt: new Date().toISOString().split('T')[0],
          status: 'sent' as const
        };
        setOffers(prev => [...prev, newOfferWithId]);

        setIsCreateDialogOpen(false);
        resetNewOfferForm();
      } else {
        alert('Failed to create offer');
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      alert('Error creating offer');
    }
  };

  const updateOffer = async (offerId: number, updates: Partial<Offer>) => {
    if (!sessionData) return;

    try {
      const response = await fetch(`${sessionData.APP_URL}/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        // Update local state
        setOffers(prev => prev.map(offer =>
          offer.id === offerId ? { ...offer, ...updates } : offer
        ));
        alert('Offer updated successfully!');
      } else {
        alert('Failed to update offer');
      }
    } catch (error) {
      console.error('Error updating offer:', error);
      alert('Error updating offer');
    }
  };

  const sendOffer = async (offer: Offer) => {
    if (!sessionData) return;

    try {
      const response = await fetch(`${sessionData.APP_URL}/api/offers/${offer.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.token}`
        },
        body: JSON.stringify({
          candidateEmail: `${offer.candidateName.toLowerCase().replace(' ', '.')}@example.com`,
          offerDetails: offer
        })
      });

      if (response.ok) {
        updateOffer(offer.id, {
          status: 'sent',
          sentAt: new Date().toISOString().split('T')[0]
        });
        alert('Offer sent successfully!');
      } else {
        alert('Failed to send offer');
      }
    } catch (error) {
      console.error('Error sending offer:', error);
      alert('Error sending offer');
    }
  };

  const rejectOffer = async (offer: Offer) => {
    if (!sessionData) return;

    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const response = await fetch(`${sessionData.APP_URL}/api/offers/${offer.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.token}`
        },
        body: JSON.stringify({
          candidateEmail: `${offer.candidateName.toLowerCase().replace(' ', '.')}@example.com`,
          rejectionReason: reason,
          offerDetails: offer
        })
      });

      if (response.ok) {
        updateOffer(offer.id, {
          status: 'rejected',
          rejectedAt: new Date().toISOString().split('T')[0],
          notes: reason
        });
        alert('Rejection message sent successfully!');
      } else {
        alert('Failed to send rejection message');
      }
    } catch (error) {
      console.error('Error rejecting offer:', error);
      alert('Error rejecting offer');
    }
  };


  const resetNewOfferForm = () => {
    setNewOffer({
      candidateId: '',
      candidateName: '',
      position: '',
      jobTitle: '',
      salary: '',
      startDate: '',
      templateId: 'standard',
      notes: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusCounts = () => {
    return {
      total: offers.length,
      sent: offers.filter(o => o.status === 'sent').length,
      accepted: offers.filter(o => o.status === 'accepted').length,
      rejected: offers.filter(o => o.status === 'rejected').length
    };
  };

  const stats = getStatusCounts();

  const downloadOfferLetter = (offer: Offer) => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Offer Letter - ${offer.candidateName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; }
        .date { text-align: right; margin-bottom: 20px; }
        .address { margin-bottom: 20px; }
        .salutation { margin-bottom: 20px; }
        .content { margin-bottom: 20px; }
        .closing { margin-top: 30px; }
        .signature { margin-top: 40px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>[Company Name]</h1>
        <p>[Company Address]</p>
        <p>[City, State, ZIP Code]</p>
        <p>[Phone] | [Email]</p>
    </div>

    <div class="date">
        ${new Date().toLocaleDateString()}
    </div>

    <div class="address">
        ${offer.candidateName}<br>
        [Candidate Address]<br>
        [City, State, ZIP Code]
    </div>

    <div class="salutation">
        Dear ${offer.candidateName},
    </div>

    <div class="content">
        <p>We are pleased to offer you the position of <strong>${offer.position}</strong> at [Company Name]. This offer is contingent upon satisfactory completion of background checks and reference verification.</p>

        <h3>Position Details:</h3>
        <ul>
            <li><strong>Job Title:</strong> ${offer.position}</li>
            <li><strong>Start Date:</strong> ${offer.startDate}</li>
            <li><strong>Compensation:</strong> ${offer.salary}</li>
            <li><strong>Location:</strong> [Location]</li>
        </ul>

        <h3>Benefits:</h3>
        <ul>
            <li>Health insurance</li>
            <li>Paid time off</li>
            <li>Professional development allowance</li>
        </ul>

        <p>Please review this offer and let us know your decision by ${offer.expiresAt}.</p>

        <p>If you have any questions, please contact us at [Contact Information].</p>

        <p>We look forward to welcoming you to the team!</p>
    </div>

    <div class="closing">
        Sincerely,<br><br>

        [Your Name]<br>
        [Your Position]<br>
        [Company Name]<br>
        [Contact Information]
    </div>

    <div class="signature" style="border-top: 1px solid #000; width: 200px; margin-top: 20px; padding-top: 10px;">
        Signature
    </div>
</body>
</html>
    `;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Offer Management</h1>
          <p className="text-muted-foreground">Create, send, and track job offers</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Offer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Candidate Name</label>
                  <Input
                    value={newOffer.candidateName}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, candidateName: e.target.value }))}
                    placeholder="Enter candidate name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <Input
                    value={newOffer.position}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Enter position title"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Salary Range</label>
                  <Input
                    value={newOffer.salary}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, salary: e.target.value }))}
                    placeholder="e.g., ₹50,000 - ₹70,000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={newOffer.startDate}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Offer Template</label>
                <Select value={newOffer.templateId} onValueChange={(value) => setNewOffer(prev => ({ ...prev, templateId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={newOffer.notes}
                  onChange={(e) => setNewOffer(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any special terms or notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createOffer}>
                  Create Offer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Offers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
            <p className="text-xs text-muted-foreground">Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">Accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Offers ({stats.total})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({stats.sent})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{offer.candidateName}</h3>
                      <p className="text-sm text-gray-600">{offer.position}</p>
                      <p className="text-xs text-gray-500">Created: {offer.createdAt}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(offer.status)}
                    <div className="mt-2">
                      <p className="text-sm font-medium">{offer.salary}</p>
                      <p className="text-xs text-gray-500">Start: {offer.startDate}</p>
                    </div>
                  </div>
                </div>

                {offer.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">{offer.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Expires: {offer.expiresAt}
                    {offer.sentAt && <span className="ml-4">Sent: {offer.sentAt}</span>}
                    {offer.acceptedAt && <span className="ml-4 text-green-600">Accepted: {offer.acceptedAt}</span>}
                    {offer.rejectedAt && <span className="ml-4 text-red-600">Rejected: {offer.rejectedAt}</span>}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => { setDialogType('details'); setSelectedOffer(offer); setIsViewDialogOpen(true); }}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadOfferLetter(offer)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {offers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No offers found.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {offers.filter(o => o.status === 'sent').map((offer) => (
            <Card key={offer.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Send className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{offer.candidateName}</h3>
                      <p className="text-sm text-gray-600">{offer.position}</p>
                      <p className="text-xs text-gray-500">Sent: {offer.sentAt}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(offer.status)}
                    <div className="mt-2">
                      <p className="text-sm font-medium">{offer.salary}</p>
                      <p className="text-xs text-gray-500">Expires: {offer.expiresAt}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => sendOffer(offer)}>
                    <Send className="w-4 h-4 mr-2" />
                    Resend
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => rejectOffer(offer)}>
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          {offers.filter(o => o.status === 'accepted').map((offer) => (
            <Card key={offer.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{offer.candidateName}</h3>
                      <p className="text-sm text-gray-600">{offer.position}</p>
                      <p className="text-xs text-gray-500">Accepted: {offer.acceptedAt}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(offer.status)}
                    <div className="mt-2">
                      <p className="text-sm font-medium">{offer.salary}</p>
                      <p className="text-xs text-gray-500">Start: {offer.startDate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                   <Button variant="outline" size="sm" onClick={() => { setDialogType('contract'); setSelectedOffer(offer); setIsViewDialogOpen(true); }}>
                     <Eye className="w-4 h-4 mr-2" />
                     View Contract
                   </Button>
                   <Button
                     size="sm"
                     onClick={() => router.push(`/content/Telent-management/Onboarding-management?candidate=${offer.candidateName}&position=${offer.position}`)}
                   >
                     <CheckCircle className="w-4 h-4 mr-2" />
                     Start Onboarding
                   </Button>
                 </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {offers.filter(o => o.status === 'rejected').map((offer) => (
            <Card key={offer.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <X className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{offer.candidateName}</h3>
                      <p className="text-sm text-gray-600">{offer.position}</p>
                      <p className="text-xs text-gray-500">Rejected: {offer.rejectedAt}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(offer.status)}
                    <div className="mt-2">
                      <p className="text-sm font-medium">{offer.salary}</p>
                    </div>
                  </div>
                </div>

                {offer.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Reason: {offer.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <OfferDetailsDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        offer={selectedOffer}
        type={dialogType}
      />
    </div>
  );
}