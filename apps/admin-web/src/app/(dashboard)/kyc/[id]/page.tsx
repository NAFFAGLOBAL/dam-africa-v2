'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, FileText, ZoomIn, Calendar, User } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';

const mockKYCDetail = {
  id: '1',
  driverName: 'Ouattara Seydou',
  driverEmail: 'ouattara@email.com',
  driverPhone: '+2250809101112',
  documentType: 'Carte d\'identit\u00e9',
  documentNumber: 'CI-2024-98765',
  submittedAt: '2024-07-20',
  status: 'PENDING',
  frontImage: '/placeholder-id-front.jpg',
  backImage: '/placeholder-id-back.jpg',
  selfieImage: '/placeholder-selfie.jpg',
  timeline: [
    { action: 'Document soumis par le conducteur', date: '2024-07-20T10:30:00Z' },
    { action: 'En attente de v\u00e9rification', date: '2024-07-20T10:30:00Z' },
  ],
};

export default function KYCDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const kyc = mockKYCDetail;

  return (
    <div className="space-y-6">
      <PageHeader
        title="V\u00e9rification KYC"
        breadcrumbs={[
          { label: 'KYC', href: '/kyc' },
          { label: kyc.driverName },
        ]}
        actions={
          kyc.status === 'PENDING' && (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setRejectDialogOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rejeter
              </Button>
              <Button variant="success" size="sm">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approuver
              </Button>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Driver Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations du conducteur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(kyc.driverName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{kyc.driverName}</p>
                <p className="text-xs text-muted-foreground">{kyc.driverEmail}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type de document</span>
                <span className="font-medium">{kyc.documentType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">N\u00b0 du document</span>
                <span className="font-medium">{kyc.documentNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Soumis le</span>
                <span className="font-medium">{formatDate(kyc.submittedAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Statut</span>
                <StatusBadge status={kyc.status} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents soumis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Recto', desc: 'Face avant du document' },
                  { label: 'Verso', desc: 'Face arri\u00e8re du document' },
                  { label: 'Selfie', desc: 'Photo d\'identit\u00e9' },
                ].map((doc) => (
                  <div key={doc.label} className="space-y-2">
                    <p className="text-sm font-medium">{doc.label}</p>
                    <div className="aspect-[4/3] rounded-lg bg-muted flex flex-col items-center justify-center gap-2 border-2 border-dashed cursor-pointer hover:bg-muted/80 transition-colors">
                      <FileText className="h-8 w-8 text-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground">{doc.desc}</span>
                      <ZoomIn className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kyc.timeline.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter le document KYC</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet. Le conducteur sera notifi\u00e9.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Raison du rejet</Label>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Document illisible, expir\u00e9, etc."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => setRejectDialogOpen(false)}>
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
