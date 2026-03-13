'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Globe, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    kycAlerts: true,
    paymentAlerts: true,
    incidentAlerts: true,
  });

  const [features, setFeatures] = useState({
    gpsTracking: true,
    creditScoring: true,
    autoKycReview: false,
    smsNotifications: true,
    mobilePayments: true,
    rentToOwn: true,
    supportTickets: true,
    analytics: true,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Param\u00e8tres"
        description="Configuration de la plateforme"
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">G\u00e9n\u00e9ral</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="features">Fonctionnalit\u00e9s</TabsTrigger>
          <TabsTrigger value="security">S\u00e9curit\u00e9</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Informations g\u00e9n\u00e9rales</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom de l&apos;entreprise</Label>
                  <Input defaultValue="DAMFlotte CLD" />
                </div>
                <div className="space-y-2">
                  <Label>Email de contact</Label>
                  <Input type="email" defaultValue="contact@damflotte.com" />
                </div>
                <div className="space-y-2">
                  <Label>T\u00e9l\u00e9phone</Label>
                  <Input defaultValue="+225 01 02 03 04 05" />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input defaultValue="Cocody, Abidjan, C\u00f4te d'Ivoire" />
                </div>
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select defaultValue="XOF">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XOF">FCFA (XOF)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="USD">Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Apparence</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Th\u00e8me</Label>
                  <Select defaultValue="light">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="system">Syst\u00e8me</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Fran\u00e7ais</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fuseau horaire</Label>
                  <Select defaultValue="GMT">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GMT">GMT+0 (Abidjan)</SelectItem>
                      <SelectItem value="WAT">WAT (Lagos)</SelectItem>
                      <SelectItem value="CET">CET (Paris)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base">Pr\u00e9f\u00e9rences de notification</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-4">Canaux</h4>
                <div className="space-y-4">
                  {[
                    { key: 'email' as const, label: 'Notifications par email' },
                    { key: 'push' as const, label: 'Notifications push' },
                    { key: 'sms' as const, label: 'Notifications SMS' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label className="font-normal">{item.label}</Label>
                      <Switch
                        checked={notifications[item.key]}
                        onCheckedChange={(checked) =>
                          setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-4">Alertes</h4>
                <div className="space-y-4">
                  {[
                    { key: 'kycAlerts' as const, label: 'Nouvelles soumissions KYC' },
                    { key: 'paymentAlerts' as const, label: 'Paiements re\u00e7us/\u00e9chou\u00e9s' },
                    { key: 'incidentAlerts' as const, label: 'Nouveaux incidents' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <Label className="font-normal">{item.label}</Label>
                      <Switch
                        checked={notifications[item.key]}
                        onCheckedChange={(checked) =>
                          setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feature flags</CardTitle>
              <CardDescription>Activer ou d\u00e9sactiver les fonctionnalit\u00e9s de la plateforme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'gpsTracking' as const, label: 'Suivi GPS', desc: 'Localisation en temps r\u00e9el des v\u00e9hicules' },
                { key: 'creditScoring' as const, label: 'Scoring de cr\u00e9dit', desc: 'Calcul automatique du score DAM' },
                { key: 'autoKycReview' as const, label: 'V\u00e9rification KYC automatique', desc: 'V\u00e9rification automatis\u00e9e des documents via IA' },
                { key: 'smsNotifications' as const, label: 'Notifications SMS', desc: 'Envoi de SMS aux conducteurs' },
                { key: 'mobilePayments' as const, label: 'Paiements mobiles', desc: 'Wave, Orange Money, MTN MoMo' },
                { key: 'rentToOwn' as const, label: 'Location-vente', desc: 'Contrats de location avec option d\'achat' },
                { key: 'supportTickets' as const, label: 'Tickets de support', desc: 'Syst\u00e8me de support int\u00e9gr\u00e9' },
                { key: 'analytics' as const, label: 'Analytique avanc\u00e9e', desc: 'Rapports et tableaux de bord avanc\u00e9s' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={features[item.key]}
                    onCheckedChange={(checked) =>
                      setFeatures((prev) => ({ ...prev, [item.key]: checked }))
                    }
                  />
                </div>
              ))}
              <Separator />
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">S\u00e9curit\u00e9</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Authentification \u00e0 deux facteurs</p>
                    <p className="text-xs text-muted-foreground">Requis pour tous les admin</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Expiration de session</p>
                    <p className="text-xs text-muted-foreground">D\u00e9connexion automatique</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="60">1 heure</SelectItem>
                      <SelectItem value="480">8 heures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Journalisation des activit\u00e9s</p>
                    <p className="text-xs text-muted-foreground">Enregistrer toutes les actions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Changer le mot de passe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mot de passe actuel</Label>
                  <Input type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
                </div>
                <div className="space-y-2">
                  <Label>Nouveau mot de passe</Label>
                  <Input type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
                </div>
                <div className="space-y-2">
                  <Label>Confirmer le mot de passe</Label>
                  <Input type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
                </div>
                <Button>Mettre \u00e0 jour</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
