"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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

interface OfferDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  offer: Offer | null;
  type?: 'details' | 'contract';
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'draft':
      return <Badge variant="outline">Draft</Badge>;
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

export default function OfferDetailsDialog({ isOpen, onOpenChange, offer, type = 'details' }: OfferDetailsDialogProps) {
  const title = type === 'contract' ? 'Contract Details' : 'Offer Details';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {offer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Candidate Name</label>
                <p className="text-sm text-gray-600">{offer.candidateName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Position</label>
                <p className="text-sm text-gray-600">{offer.position}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Salary</label>
                <p className="text-sm text-gray-600">{offer.salary}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <p className="text-sm text-gray-600">{offer.startDate}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <div className="mt-1">{getStatusBadge(offer.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Created At</label>
              <p className="text-sm text-gray-600">{offer.createdAt}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Expires At</label>
              <p className="text-sm text-gray-600">{offer.expiresAt}</p>
            </div>
            {offer.sentAt && (
              <div>
                <label className="text-sm font-medium">Sent At</label>
                <p className="text-sm text-gray-600">{offer.sentAt}</p>
              </div>
            )}
            {offer.acceptedAt && (
              <div>
                <label className="text-sm font-medium">Accepted At</label>
                <p className="text-sm text-gray-600">{offer.acceptedAt}</p>
              </div>
            )}
            {offer.rejectedAt && (
              <div>
                <label className="text-sm font-medium">Rejected At</label>
                <p className="text-sm text-gray-600">{offer.rejectedAt}</p>
              </div>
            )}
            {offer.notes && (
              <div>
                <label className="text-sm font-medium">Notes</label>
                <p className="text-sm text-gray-600">{offer.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}