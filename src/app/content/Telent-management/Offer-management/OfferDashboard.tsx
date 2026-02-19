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
import { startOfferManagementTour, shouldTriggerOfferManagementTour } from "./OfferManagementTourSteps";
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
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
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


interface OfferDashboardProps {
  showHeader?: boolean;
  candidate?: string;
  position?: string;
  candidateId?: number;
}

export default function OfferDashboard({ showHeader = true, candidate, position, candidateId }: OfferDashboardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [templates, setTemplates] = useState<OfferTemplate[]>([]);
  const [positions, setPositions] = useState<{id: number, title: string}[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'details' | 'contract'>('details');
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [tourInitialized, setTourInitialized] = useState(false);

  // Handle tour trigger
  useEffect(() => {
    if (tourInitialized) return;

    const shouldStartTour = shouldTriggerOfferManagementTour();
    console.log('[OfferDashboard] Should trigger offer tour:', shouldStartTour);

    if (shouldStartTour) {
      // Clear the trigger flag
      sessionStorage.removeItem('triggerPageTour');

      // Start the tour after a delay
      setTimeout(() => {
        startOfferManagementTour();
        setTourInitialized(true);
      }, 500);
    } else {
      setTourInitialized(true);
    }
  }, [tourInitialized]);

  const [newOffer, setNewOffer] = useState({
    candidateId: '',
    candidateName: '',
    position: '',
    jobTitle: '',
    jobId: '',
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
    if (positions.length > 0) {
      const candidateParam = searchParams.get('candidate');
      const positionParam = searchParams.get('position');
      const candidateIdParam = searchParams.get('candidateId');

      if (candidateParam && positionParam) {
        const pos = positions.find(p => p.title === positionParam);
        if (pos) {
          setNewOffer(prev => ({
            ...prev,
            candidateId: candidateIdParam || '',
            candidateName: candidateParam,
            position: pos.title,
            jobTitle: pos.title,
            jobId: pos.id.toString()
          }));
        } else {
          const pos2 = positions.find(p => p.id.toString() === positionParam);
          if (pos2) {
            setNewOffer(prev => ({
              ...prev,
              candidateId: candidateIdParam || '',
              candidateName: candidateParam,
              position: pos2.title,
              jobTitle: pos2.title,
              jobId: pos2.id.toString()
            }));
          } else {
            setNewOffer(prev => ({
              ...prev,
              candidateId: candidateIdParam || '',
              candidateName: candidateParam,
              position: positionParam,
              jobTitle: positionParam,
              jobId: ''
            }));
          }
        }
        // Auto-open the create dialog
        setIsCreateDialogOpen(true);
      }
    }
  }, [positions, searchParams]);

  useEffect(() => {
    if (positions.length > 0 && candidate && position) {
      const pos = positions.find(p => p.title === position);
      if (pos) {
        setNewOffer(prev => ({
          ...prev,
          candidateId: candidateId ? candidateId.toString() : '',
          candidateName: candidate,
          position: pos.title,
          jobTitle: pos.title,
          jobId: pos.id.toString()
        }));
      } else {
        const pos2 = positions.find(p => p.id.toString() === position);
        if (pos2) {
          setNewOffer(prev => ({
            ...prev,
            candidateId: candidateId ? candidateId.toString() : '',
            candidateName: candidate,
            position: pos2.title,
            jobTitle: pos2.title,
            jobId: pos2.id.toString()
          }));
        } else {
          setNewOffer(prev => ({
            ...prev,
            candidateId: candidateId ? candidateId.toString() : '',
            candidateName: candidate,
            position: position,
            jobTitle: position,
            jobId: ''
          }));
        }
      }
      // Auto-open the create dialog
      setIsCreateDialogOpen(true);
    }
  }, [positions, candidate, position, candidateId]);

  useEffect(() => {
    if (!sessionData || !sessionData.APP_URL || !sessionData.token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Try to fetch job-applications data for candidate names
        const applicationsResponse = await fetch(
          `${sessionData.APP_URL}/api/job-applications?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        let candidateMap: { [key: number]: string } = {};
        if (applicationsResponse.ok) {
          const applicationsResult = await applicationsResponse.json();
          applicationsResult.data.forEach((app: any) => {
            const fullName = [app.first_name, app.middle_name, app.last_name].filter(Boolean).join(' ');
            candidateMap[app.id] = fullName || `Candidate ${app.id}`;
          });
        }

        // Try to fetch real offers data
        const offersResponse = await fetch(
          `${sessionData.APP_URL}/api/offers?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (offersResponse.ok) {
          const offersResult = await offersResponse.json();
          const mappedOffers = offersResult.data.map((item: any) => {
            const createdAt = new Date(item.created_at).toISOString().split('T')[0];
            const startDate = item.start_date;
            const expiresAt = item.expires_at ? new Date(item.expires_at).toISOString().split('T')[0] : '';
            const sentAt = item.sent_at ? new Date(item.sent_at).toISOString().split('T')[0] : undefined;
            const rejectedAt = item.rejected_at ? new Date(item.rejected_at).toISOString().split('T')[0] : undefined;
            return {
              id: item.id,
              candidateId: item.application_id,
              candidateName: candidateMap[item.application_id] || `Candidate ${item.application_id}`,
              position: item.position,
              jobTitle: item.position,
              salary: item.salary,
              startDate,
              status: item.status as 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired',
              createdAt,
              expiresAt,
              sentAt,
              acceptedAt: undefined,
              rejectedAt,
              offerLetterUrl: item.offer_letter_url,
              notes: item.notes,
            };
          });
          setOffers(mappedOffers);
        } else {
          // No data available
          setOffers([]);
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
          setTemplates(templatesResult.data || []);
        } else {
          // No templates available
          setTemplates([]);
        }

        // Try to fetch positions
        const positionsResponse = await fetch(
          `${sessionData.APP_URL}/api/job-postings?type=API&token=${sessionData.token}&sub_institute_id=${sessionData.sub_institute_id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (positionsResponse.ok) {
          const positionsResult = await positionsResponse.json();
          setPositions(positionsResult.data || []);
        } else {
          setPositions([]);
        }
      } catch (error) {
        console.warn("API error:", error);
        setOffers([]);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionData]);

  const createOffer = async () => {
    if (!sessionData) return;

    setIsCreatingOffer(true);
    try {
      const response = await fetch(`${sessionData.APP_URL}/api/talent-offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: "API",
          token: sessionData.token,
          sub_institute_id: sessionData.sub_institute_id,
          user_id: sessionData.user_id,
          position: newOffer.position,
          application_id: parseInt(newOffer.candidateId),
          job_id: parseInt(newOffer.jobId),
          salary: newOffer.salary,
          start_date: newOffer.startDate,
          notes: newOffer.notes
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Offer created successfully!');

        // Add to local state
        const newOfferWithId: Offer = {
          id: result.data?.id || Date.now(),
          candidateId: parseInt(newOffer.candidateId),
          candidateName: newOffer.candidateName,
          position: newOffer.position,
          jobTitle: newOffer.jobTitle,
          salary: newOffer.salary,
          startDate: newOffer.startDate,
          status: 'draft',
          createdAt: new Date().toISOString().split('T')[0],
          expiresAt: '',
          notes: newOffer.notes
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
    } finally {
      setIsCreatingOffer(false);
    }
  };

  const updateOffer = async (offerId: number, updates: Partial<Offer>) => {
    if (!sessionData) return;

    try {
      const response = await fetch(`${sessionData.APP_URL}/api/talent-offers/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: "API",
          token: sessionData.token,
          ...updates
        })
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
      const response = await fetch(`${sessionData.APP_URL}/api/talent-offers/${offer.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: "API",
          token: sessionData.token,
          candidateEmail: `${offer.candidateName.toLowerCase().replace(' ', '.')}@example.com`,
          offerDetails: offer
        })
      });

      if (response.ok) {
        updateOffer(offer.id, {
          status: 'sent',
          sentAt: new Date().toISOString().split('T')[0],
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days from now
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
      const response = await fetch(`${sessionData.APP_URL}/api/talent-offers/${offer.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: "API",
          token: sessionData.token,
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
      jobId: '',
      salary: '',
      startDate: '',
      templateId: 'standard',
      notes: ''
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
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
      draft: offers.filter(o => o.status === 'draft').length,
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
    <div className="space-y-3 bg-background rounded-xl p-4">
      {showHeader && (
        <div className="flex justify-between items-center" id="tour-offer-header">
          <div id="tour-offer-title">
            <h1 className="text-3xl font-bold">Offer Management</h1>
            <p className="text-muted-foreground">Create, send, and track job offers</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                console.log('[OfferDashboard] Manually starting offer tour...');
                sessionStorage.removeItem('offerManagementTourCompleted');
                sessionStorage.setItem('triggerPageTour', 'offer-management');
                startOfferManagementTour();
              }}
            >
              Start Tour
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)} id="tour-create-offer-button">
              <Plus className="w-4 h-4 mr-2" />
              Create New Offer
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                <Select value={newOffer.jobId} onValueChange={(value) => {
                  const pos = positions.find(p => p.id.toString() === value);
                  setNewOffer(prev => ({ ...prev, position: pos ? pos.title : '', jobTitle: pos ? pos.title : '', jobId: value }));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id.toString()}>
                        {pos.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            {/* <div>
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
            </div> */}

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="tour-offer-stats">
        <Card id="tour-stats-total">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Offers</p>
          </CardContent>
        </Card>
        <Card id="tour-stats-draft">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">Draft</p>
          </CardContent>
        </Card>
        <Card id="tour-stats-accepted">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">Accepted</p>
          </CardContent>
        </Card>
        <Card id="tour-stats-rejected">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6" id="tour-offer-tabs">
        <TabsList id="tour-tabs-list" className="bg-muted/50 flex flex-wrap h-auto p-1 gap-1 w-full max-w-full overflow-x-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 whitespace-normal data-[state=active]:bg-background data-[state=active]:shadow-md" id="tour-tab-all">All Offers ({stats.total})</TabsTrigger>
          <TabsTrigger value="sent" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 whitespace-normal data-[state=active]:bg-background data-[state=active]:shadow-md" id="tour-tab-sent">Sent ({stats.sent})</TabsTrigger>
          <TabsTrigger value="accepted" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 whitespace-normal data-[state=active]:bg-background data-[state=active]:shadow-md" id="tour-tab-accepted">Accepted ({stats.accepted})</TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 whitespace-normal data-[state=active]:bg-background data-[state=active]:shadow-md" id="tour-tab-rejected">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {offers.map((offer, index) => (
            <Card key={offer.id} id={index === 0 ? 'tour-first-offer-card' : ''}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">{offer.candidateName}</h3>
                      <p className="text-sm text-gray-600">{offer.position}</p>
                      <p className="text-xs text-gray-500">Created: {offer.createdAt}</p>
                    </div>
                  </div>
                  <div className="sm:text-right ml-auto sm:ml-0">
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

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                    <span>Expires: {offer.expiresAt}</span>
                    {offer.sentAt && <span className="block sm:inline sm:ml-4 mt-1 sm:mt-0">Sent: {offer.sentAt}</span>}
                    {offer.acceptedAt && <span className="block sm:inline sm:ml-4 mt-1 sm:mt-0 text-green-600">Accepted: {offer.acceptedAt}</span>}
                    {offer.rejectedAt && <span className="block sm:inline sm:ml-4 mt-1 sm:mt-0 text-red-600">Rejected: {offer.rejectedAt}</span>}
                  </div>
                  <div className="flex space-x-2 w-full sm:w-auto order-1 sm:order-2">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => { setDialogType('details'); setSelectedOffer(offer); setIsViewDialogOpen(true); }}>
                      <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="sm:hidden">View</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => downloadOfferLetter(offer)}>
                      <Download className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="sm:hidden">Download</span>
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

        <TabsContent value="draft" className="space-y-4" id="tour-tab-draft-content">
          {offers.filter(o => o.status === 'draft').map((offer) => (
            <Card key={offer.id}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">{offer.candidateName}</h3>
                      <p className="text-sm text-gray-600">{offer.position}</p>
                      <p className="text-xs text-gray-500">Created: {offer.createdAt}</p>
                    </div>
                  </div>
                  <div className="sm:text-right ml-auto sm:ml-0">
                    {getStatusBadge(offer.status)}
                    <div className="mt-2">
                      <p className="text-sm font-medium">{offer.salary}</p>
                      <p className="text-xs text-gray-500">Start: {offer.startDate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2" id="tour-draft-actions">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => sendOffer(offer)}  id="tour-send-offer">
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                  <Button variant="destructive" size="sm" className="w-full sm:w-auto" onClick={() => rejectOffer(offer)}>
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {offers.filter(o => o.status === 'sent').map((offer) => (
            <Card key={offer.id}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <Send className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">{offer.candidateName}</h3>
                      <p className="text-sm text-gray-600">{offer.position}</p>
                      <p className="text-xs text-gray-500">Sent: {offer.sentAt}</p>
                    </div>
                  </div>
                  <div className="sm:text-right ml-auto sm:ml-0">
                    {getStatusBadge(offer.status)}
                    <div className="mt-2">
                      <p className="text-sm font-medium">{offer.salary}</p>
                      <p className="text-xs text-gray-500">Expires: {offer.expiresAt}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="destructive" size="sm" className="w-full sm:w-auto" onClick={() => rejectOffer(offer)}>
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4" id="tour-tab-accepted-content">
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
                     id="tour-start-onboarding"
                   >
                     <CheckCircle className="w-4 h-4 mr-2" />
                     Start Onboarding
                   </Button>
                 </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4" id="tour-tab-rejected-content">
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