'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ScoreGauge } from '@/components/shared/ScoreGauge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Ban,
  CheckCircle2,
  CreditCard,
  Wallet,
  Car,
  FileText,
} from 'lucide-react';
import { getInitials, formatCurrency, formatDate, formatPhone } from '@/lib/utils';

// Mock driver detail
const mockDriver = {
  id: '1',
  firstName: 'Kouam\u00e9',
  lastName: 'Jean',
  phone: '+2250102030405',
  email: 'kouame.jean@email.com',
  address: 'Cocody, Abidjan',
  status: 'ACTIVE',
  kycStatus: 'APPROVED',
  creditScore: 780,
  joinedAt: '2024-01-15',
  dateOfBirth: '1990-05-12',
  licenseNumber: 'CI-2024-78542',
  loans: [
    { id: 'L1', amount: 2500000, status: 'ACTIVE', date: '2024-06-01', remaining: 1800000 },
    { id: 'L2', amount: 1500000, status: 'COMPLETED', date: '2024-01-15', remaining: 0 },
  ],
  payments: [
    { id: 'P1', amount: 250000, method: 'Wave', status: 'COMPLETED', date: '2024-07-15' },
    { id: 'P2', amount: 250000, method: 'Orange Money', status: 'COMPLETED', date: '2024-06-15' },
    { id: 'P3', amount: 250000, method: 'Wave', status: 'PENDING', date: '2024-08-15' },
  ],
  vehicles: [
    { id: 'V1', make: 'Toyota', model: 'Hilux', plate: 'AB-1234-CD', status: 'RENTED' },
  ],
  activity: [
    { id: 'A1', action: 'Paiement effectu\u00e9 - 250 000 FCFA via Wave', date: '2024-07-15' },
    { id: 'A2', action: 'Document KYC approuv\u00e9', date: '2024-06-20' },
    { id: 'A3', action: 'Pr\u00eat d\u00e9caiss\u00e9 - 2 500 000 FCFA', date: '2024-06-01' },
    { id: 'A4', action: 'Inscription sur la plateforme', date: '2024-01-15' },
  ],
};

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const driver = mockDriver;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${driver.firstName} ${driver.lastName}`}
        breadcrumbs={[
          { label: 'Conducteurs', href: '/drivers' },
          { label: `${driver.firstName} ${driver.lastName}` },
        ]}
        actions={
          <div className="flex gap-2">
            {driver.status === 'ACTIVE' ? (
              <Button variant="destructive" size="sm">
                <Ban className="mr-2 h-4 w-4" />
                Suspendre
              </Button>
            ) : (
              <Button variant="success" size="sm">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Activer
              </Button>
            )}
          </div>
        }
      />

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {getInitials(`${driver.firstName} ${driver.lastName}`)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold">
                  {driver.firstName} {driver.lastName}
                </h2>
                <StatusBadge status={driver.status} />
                <StatusBadge status={driver.kycStatus} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {formatPhone(driver.phone)}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {driver.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {driver.address}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Inscrit le {formatDate(driver.joinedAt)}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <ScoreGauge score={driver.creditScore} size={120} strokeWidth={10} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="loans">Pr\u00eats</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="vehicles">V\u00e9hicules</TabsTrigger>
          <TabsTrigger value="activity">Activit\u00e9</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Nom complet', value: `${driver.firstName} ${driver.lastName}` },
                  { label: 'Date de naissance', value: formatDate(driver.dateOfBirth) },
                  { label: 'T\u00e9l\u00e9phone', value: formatPhone(driver.phone) },
                  { label: 'Email', value: driver.email },
                  { label: 'Adresse', value: driver.address },
                  { label: 'N\u00b0 Permis', value: driver.licenseNumber },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">R\u00e9sum\u00e9 financier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Pr\u00eats actifs', value: '1', icon: CreditCard },
                  { label: 'Montant total emprunt\u00e9', value: formatCurrency(4000000), icon: Wallet },
                  { label: 'Restant d\u00fb', value: formatCurrency(1800000), icon: Wallet },
                  { label: 'Paiements effectu\u00e9s', value: '8', icon: CheckCircle2 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loans">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {driver.loans.map((loan) => (
                  <div key={loan.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formatCurrency(loan.amount)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(loan.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {loan.remaining > 0 && (
                        <span className="text-sm text-muted-foreground">
                          Restant: {formatCurrency(loan.remaining)}
                        </span>
                      )}
                      <StatusBadge status={loan.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {driver.payments.map((payment) => (
                  <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.method} - {formatDate(payment.date)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={payment.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {driver.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                        <Car className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {vehicle.make} {vehicle.model}
                        </p>
                        <p className="text-xs text-muted-foreground">{vehicle.plate}</p>
                      </div>
                    </div>
                    <StatusBadge status={vehicle.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="p-6">
              <div className="relative space-y-6">
                {driver.activity.map((item, i) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary shrink-0 mt-1.5" />
                      {i < driver.activity.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm">{item.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
