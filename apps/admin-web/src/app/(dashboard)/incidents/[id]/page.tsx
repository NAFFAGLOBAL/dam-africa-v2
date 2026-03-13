'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { incidentsApi } from '@/lib/api';
import { formatDateTime, formatCurrency, cn } from '@/lib/utils';
import { LoadingState } from '@/components/shared/LoadingState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  AlertTriangle,
  Car,
  User,
  MapPin,
  Calendar,
  FileText,
  Camera,
  MessageSquare,
  Shield,
  Send,
  Scale,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react';

interface AccidentReport {
  id: string;
  userId: string;
  vehicleId: string;
  reportNumber: string;
  severity: string;
  status: string;
  driverFault: string;
  locationDescription: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string;
  thirdPartyInvolved: boolean;
  policeReportUrl: string | null;
  policeReportNumber: string | null;
  occurredAt: string;
  creditScoreImpact: number | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  vehicle: {
    id: string;
    licensePlate: string;
    make: string;
    model: string;
  };
  media: Array<{
    id: string;
    fileUrl: string;
    type: string;
    caption: string | null;
    createdAt: string;
  }>;
  notes: Array<{
    id: string;
    content: string;
    createdAt: string;
    admin: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

const severityConfig: Record<string, { label: string; color: string; bg: string }> = {
  MINOR: { label: 'Faible', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  MODERATE: { label: 'Moyen-grave', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  SEVERE: { label: 'Grave', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  TOTAL_LOSS: { label: 'Extrêmement grave', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
};

const faultConfig: Record<string, { label: string; color: string }> = {
  NOT_DETERMINED: { label: 'Non déterminé', color: 'text-gray-600' },
  DRIVER_AT_FAULT: { label: 'Chauffeur en tort', color: 'text-red-600' },
  DRIVER_NOT_AT_FAULT: { label: 'Chauffeur non responsable', color: 'text-emerald-600' },
};

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [report, setReport] = useState<AccidentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [severityDialogOpen, setSeverityDialogOpen] = useState(false);
  const [policeDialogOpen, setPoliceDialogOpen] = useState(false);
  const [faultDialogOpen, setFaultDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Form states
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [policeReportUrl, setPoliceReportUrl] = useState('');
  const [policeReportNumber, setPoliceReportNumber] = useState('');
  const [selectedFault, setSelectedFault] = useState('');
  const [creditImpact, setCreditImpact] = useState('50');
  const [noteContent, setNoteContent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await incidentsApi.get(id);
      setReport(res.data.data);
    } catch {
      setError('Impossible de charger le rapport');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleUpdateSeverity = async () => {
    if (!selectedSeverity) return;
    setSubmitting(true);
    try {
      await incidentsApi.updateSeverity(id, selectedSeverity);
      setSeverityDialogOpen(false);
      fetchReport();
    } catch {
      alert('Erreur lors de la mise à jour de la gravité');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAttachPoliceReport = async () => {
    if (!policeReportUrl) return;
    setSubmitting(true);
    try {
      await incidentsApi.attachPoliceReport(id, {
        policeReportUrl,
        policeReportNumber: policeReportNumber || undefined,
      });
      setPoliceDialogOpen(false);
      setPoliceReportUrl('');
      setPoliceReportNumber('');
      fetchReport();
    } catch {
      alert('Erreur lors de l\'ajout du rapport de police');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetermineResponsibility = async () => {
    if (!selectedFault) return;
    setSubmitting(true);
    try {
      await incidentsApi.determineResponsibility(id, {
        driverFault: selectedFault,
        creditScoreImpact: selectedFault === 'DRIVER_AT_FAULT' ? parseInt(creditImpact) : undefined,
      });
      setFaultDialogOpen(false);
      fetchReport();
    } catch {
      alert('Erreur lors de la détermination de la responsabilité');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    setSubmitting(true);
    try {
      await incidentsApi.addNote(id, noteContent);
      setNoteDialogOpen(false);
      setNoteContent('');
      fetchReport();
    } catch {
      alert('Erreur lors de l\'ajout de la note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;
    setSubmitting(true);
    try {
      await incidentsApi.updateStatus(id, selectedStatus);
      setStatusDialogOpen(false);
      fetchReport();
    } catch {
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Chargement...</h1>
        </div>
        <LoadingState type="detail" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Rapport introuvable</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{error || 'Ce rapport n\'existe pas.'}</p>
            <Button className="mt-4" onClick={() => router.push('/incidents')}>
              Retour aux incidents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const severity = severityConfig[report.severity] || severityConfig.MINOR;
  const fault = faultConfig[report.driverFault] || faultConfig.NOT_DETERMINED;
  const isResolved = report.status === 'RESOLVED' || report.status === 'CLOSED';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Rapport d&apos;accident</h1>
            <p className="text-sm text-muted-foreground font-mono">{report.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={report.status} />
          <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', severity.bg, severity.color)}>
            {severity.label}
          </span>
          {report.thirdPartyInvolved && (
            <Badge variant="outline" className="text-xs">Tiers impliqué</Badge>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Driver */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {report.user.firstName} {report.user.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{report.user.email}</p>
                {report.user.phone && (
                  <p className="text-xs text-muted-foreground">{report.user.phone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Car className="h-5 w-5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{report.vehicle.make} {report.vehicle.model}</p>
                <p className="text-xs text-muted-foreground font-mono">{report.vehicle.licensePlate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Date */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{report.locationDescription || 'Lieu non précisé'}</p>
                <p className="text-xs text-muted-foreground">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  {formatDateTime(report.occurredAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content in tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="media">
            Photos ({report.media?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="notes">
            Notes ({report.notes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {report.description || 'Aucune description fournie.'}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Responsibility */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Responsabilité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Décision</span>
                  <span className={cn('text-sm font-semibold', fault.color)}>{fault.label}</span>
                </div>
                {report.creditScoreImpact != null && report.creditScoreImpact > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Impact score crédit</span>
                    <span className="text-sm font-bold text-red-600">-{report.creditScoreImpact} pts</span>
                  </div>
                )}
                {report.resolvedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Résolu le</span>
                    <span className="text-sm">{formatDateTime(report.resolvedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Police Report */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Rapport de police
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.policeReportUrl ? (
                  <>
                    {report.policeReportNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Numéro</span>
                        <span className="text-sm font-mono">{report.policeReportNumber}</span>
                      </div>
                    )}
                    <a
                      href={report.policeReportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      Voir le rapport
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun rapport de police attaché</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Location details */}
          {(report.latitude != null && report.longitude != null) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Géolocalisation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm">
                  <span className="text-muted-foreground">Lat: <span className="font-mono text-foreground">{report.latitude.toFixed(6)}</span></span>
                  <span className="text-muted-foreground">Lng: <span className="font-mono text-foreground">{report.longitude.toFixed(6)}</span></span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chronologie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Date de l&apos;accident</span>
                  <span>{formatDateTime(report.occurredAt)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Déclaré le</span>
                  <span>{formatDateTime(report.createdAt)}</span>
                </div>
                {report.resolvedAt && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Résolu le</span>
                      <span>{formatDateTime(report.resolvedAt)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Photos et documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.media && report.media.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {report.media.map((m) => (
                    <a
                      key={m.id}
                      href={m.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-lg border overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all"
                    >
                      {m.type === 'PHOTO' ? (
                        <img
                          src={m.fileUrl}
                          alt={m.caption || 'Photo accident'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center gap-2">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{m.type}</span>
                        </div>
                      )}
                      {m.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                          <p className="text-xs text-white truncate">{m.caption}</p>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Camera className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Aucune photo ou document ajouté</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Notes internes
              </CardTitle>
              <Button size="sm" onClick={() => setNoteDialogOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Ajouter une note
              </Button>
            </CardHeader>
            <CardContent>
              {report.notes && report.notes.length > 0 ? (
                <div className="space-y-4">
                  {report.notes.map((note) => (
                    <div key={note.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {note.admin.firstName} {note.admin.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(note.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Aucune note pour ce dossier</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Severity classification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Classifier la gravité</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Gravité actuelle : <span className={cn('font-semibold', severity.color)}>{severity.label}</span>
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedSeverity(report.severity);
                    setSeverityDialogOpen(true);
                  }}
                >
                  Modifier la gravité
                </Button>
              </CardContent>
            </Card>

            {/* Police report */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rapport de police</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {report.policeReportUrl ? 'Rapport de police attaché' : 'Aucun rapport attaché'}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setPoliceDialogOpen(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {report.policeReportUrl ? 'Modifier le rapport' : 'Attacher un rapport'}
                </Button>
              </CardContent>
            </Card>

            {/* Determine responsibility */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Déterminer la responsabilité</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {report.driverFault === 'NOT_DETERMINED'
                    ? 'La responsabilité n\'a pas encore été déterminée.'
                    : `Décision : ${fault.label}`}
                </p>
                <Button
                  className="w-full"
                  variant={isResolved ? 'outline' : 'default'}
                  disabled={report.status === 'CLOSED'}
                  onClick={() => {
                    setSelectedFault('');
                    setCreditImpact('50');
                    setFaultDialogOpen(true);
                  }}
                >
                  <Scale className="h-4 w-4 mr-2" />
                  {report.driverFault === 'NOT_DETERMINED' ? 'Déterminer' : 'Modifier la décision'}
                </Button>
              </CardContent>
            </Card>

            {/* Update status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mettre à jour le statut</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Statut actuel : <StatusBadge status={report.status} />
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedStatus('');
                    setStatusDialogOpen(true);
                  }}
                >
                  Changer le statut
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Dialogs ───────────────────────────────────────────────────────── */}

      {/* Severity Dialog */}
      <Dialog open={severityDialogOpen} onOpenChange={setSeverityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Classifier la gravité</DialogTitle>
            <DialogDescription>Sélectionnez le niveau de gravité de cet accident.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(severityConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setSelectedSeverity(key)}
                  className={cn(
                    'rounded-lg border-2 p-3 text-center text-sm font-medium transition-all',
                    selectedSeverity === key
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted hover:border-muted-foreground/20'
                  )}
                >
                  <span className={cfg.color}>{cfg.label}</span>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSeverityDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateSeverity} disabled={submitting || !selectedSeverity}>
              {submitting ? 'Enregistrement...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Police Report Dialog */}
      <Dialog open={policeDialogOpen} onOpenChange={setPoliceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attacher un rapport de police</DialogTitle>
            <DialogDescription>Ajoutez le lien vers le rapport de police et son numéro.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>URL du rapport *</Label>
              <Input
                placeholder="https://..."
                value={policeReportUrl}
                onChange={(e) => setPoliceReportUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Numéro du rapport</Label>
              <Input
                placeholder="PV-2024-001"
                value={policeReportNumber}
                onChange={(e) => setPoliceReportNumber(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPoliceDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAttachPoliceReport} disabled={submitting || !policeReportUrl}>
              {submitting ? 'Enregistrement...' : 'Attacher'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Responsibility Dialog */}
      <Dialog open={faultDialogOpen} onOpenChange={setFaultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Déterminer la responsabilité</DialogTitle>
            <DialogDescription>
              Cette action clôturera le dossier et, en cas de tort, impactera le score de crédit du chauffeur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-3">
              <button
                onClick={() => setSelectedFault('DRIVER_AT_FAULT')}
                className={cn(
                  'w-full rounded-lg border-2 p-4 text-left transition-all',
                  selectedFault === 'DRIVER_AT_FAULT'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                    : 'border-transparent bg-muted hover:border-muted-foreground/20'
                )}
              >
                <p className="font-medium text-red-600">Chauffeur en tort</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Le score de crédit sera impacté négativement
                </p>
              </button>
              <button
                onClick={() => setSelectedFault('DRIVER_NOT_AT_FAULT')}
                className={cn(
                  'w-full rounded-lg border-2 p-4 text-left transition-all',
                  selectedFault === 'DRIVER_NOT_AT_FAULT'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10'
                    : 'border-transparent bg-muted hover:border-muted-foreground/20'
                )}
              >
                <p className="font-medium text-emerald-600">Chauffeur non responsable</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aucun impact sur le score de crédit
                </p>
              </button>
            </div>

            {selectedFault === 'DRIVER_AT_FAULT' && (
              <div className="space-y-2 rounded-lg border border-red-200 dark:border-red-800 p-4">
                <Label className="text-red-600">Impact sur le score de crédit</Label>
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-bold">-</span>
                  <Input
                    type="number"
                    min="0"
                    max="200"
                    value={creditImpact}
                    onChange={(e) => setCreditImpact(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">points</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Valeur par défaut : 50 points. Maximum : 200 points.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFaultDialogOpen(false)}>Annuler</Button>
            <Button
              onClick={handleDetermineResponsibility}
              disabled={submitting || !selectedFault}
              variant={selectedFault === 'DRIVER_AT_FAULT' ? 'destructive' : 'default'}
            >
              {submitting ? 'Enregistrement...' : 'Confirmer la décision'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une note interne</DialogTitle>
            <DialogDescription>Cette note sera visible uniquement par les administrateurs.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <textarea
              className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Saisissez votre note..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNoteDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddNote} disabled={submitting || !noteContent.trim()}>
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Envoi...' : 'Envoyer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre à jour le statut</DialogTitle>
            <DialogDescription>Changez le statut de ce dossier d&apos;accident.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { value: 'INVESTIGATING', label: 'En cours d\'investigation' },
              { value: 'RESOLVED', label: 'Résolu' },
              { value: 'CLOSED', label: 'Clôturé' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedStatus(opt.value)}
                className={cn(
                  'w-full rounded-lg border-2 p-3 text-left text-sm font-medium transition-all',
                  selectedStatus === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-muted hover:border-muted-foreground/20'
                )}
              >
                <div className="flex items-center gap-2">
                  <StatusBadge status={opt.value} />
                  <span>{opt.label}</span>
                </div>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setStatusDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateStatus} disabled={submitting || !selectedStatus}>
              {submitting ? 'Enregistrement...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
