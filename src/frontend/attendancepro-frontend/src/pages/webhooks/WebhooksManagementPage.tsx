import React, { useState, useEffect } from 'react';
import { Plus, Settings, Activity, AlertCircle, CheckCircle, XCircle, RefreshCw, Trash2, Edit, Eye, Play } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Alert, AlertDescription } from '../../components/ui/alert';

import webhooksService, { 
  WebhookSubscription, 
  CreateWebhookSubscriptionRequest, 
  UpdateWebhookSubscriptionRequest,
  WebhookDelivery,
  WebhookStats,
  WebhookEventType,
  TriggerWebhookRequest
} from '../../services/webhooksService';

const WebhooksManagementPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<WebhookSubscription[]>([]);
  const [eventTypes, setEventTypes] = useState<WebhookEventType[]>([]);
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<WebhookSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isDeliveryDialogOpen, setIsDeliveryDialogOpen] = useState(false);

  const [createForm, setCreateForm] = useState<CreateWebhookSubscriptionRequest>({
    name: '',
    url: '',
    eventTypes: [],
    secret: '',
    maxRetries: 3,
    retryDelay: 5000,
    headers: {}
  });

  const [editForm, setEditForm] = useState<UpdateWebhookSubscriptionRequest>({});
  const [testForm, setTestForm] = useState<TriggerWebhookRequest>({
    eventType: '',
    payload: {}
  });

  const [customHeaders, setCustomHeaders] = useState<Array<{key: string, value: string}>>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subscriptionsData, eventTypesData, statsData] = await Promise.all([
        webhooksService.getSubscriptions(),
        webhooksService.getEventTypes(),
        webhooksService.getWebhookStats()
      ]);
      
      setSubscriptions(subscriptionsData);
      setEventTypes(eventTypesData);
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveries = async (subscriptionId: string) => {
    try {
      const deliveriesData = await webhooksService.getDeliveryHistory(subscriptionId);
      setDeliveries(deliveriesData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateSubscription = async () => {
    try {
      const headers: Record<string, string> = {};
      customHeaders.forEach(header => {
        if (header.key && header.value) {
          headers[header.key] = header.value;
        }
      });

      await webhooksService.createSubscription({
        ...createForm,
        headers
      });
      
      setIsCreateDialogOpen(false);
      setCreateForm({
        name: '',
        url: '',
        eventTypes: [],
        secret: '',
        maxRetries: 3,
        retryDelay: 5000,
        headers: {}
      });
      setCustomHeaders([]);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!selectedSubscription) return;

    try {
      const headers: Record<string, string> = {};
      customHeaders.forEach(header => {
        if (header.key && header.value) {
          headers[header.key] = header.value;
        }
      });

      await webhooksService.updateSubscription(selectedSubscription.id, {
        ...editForm,
        headers
      });
      
      setIsEditDialogOpen(false);
      setEditForm({});
      setCustomHeaders([]);
      setSelectedSubscription(null);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook subscription?')) return;

    try {
      await webhooksService.deleteSubscription(id);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTriggerWebhook = async () => {
    try {
      let payload;
      try {
        payload = JSON.parse(testForm.payload as string);
      } catch {
        payload = testForm.payload;
      }

      await webhooksService.triggerWebhook({
        eventType: testForm.eventType,
        payload
      });
      
      setIsTestDialogOpen(false);
      setTestForm({ eventType: '', payload: {} });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRetryDelivery = async (deliveryId: string) => {
    try {
      await webhooksService.retryDelivery(deliveryId);
      if (selectedSubscription) {
        await loadDeliveries(selectedSubscription.id);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openEditDialog = (subscription: WebhookSubscription) => {
    setSelectedSubscription(subscription);
    setEditForm({
      name: subscription.name,
      url: subscription.url,
      eventTypes: subscription.eventTypes,
      isActive: subscription.isActive,
      secret: subscription.secret,
      maxRetries: subscription.retryPolicy.maxRetries,
      retryDelay: subscription.retryPolicy.retryDelay
    });
    
    const headers = Object.entries(subscription.headers || {}).map(([key, value]) => ({ key, value }));
    setCustomHeaders(headers);
    setIsEditDialogOpen(true);
  };

  const openDeliveryDialog = async (subscription: WebhookSubscription) => {
    setSelectedSubscription(subscription);
    await loadDeliveries(subscription.id);
    setIsDeliveryDialogOpen(true);
  };

  const addCustomHeader = () => {
    setCustomHeaders([...customHeaders, { key: '', value: '' }]);
  };

  const updateCustomHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customHeaders];
    updated[index][field] = value;
    setCustomHeaders(updated);
  };

  const removeCustomHeader = (index: number) => {
    setCustomHeaders(customHeaders.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhooks Management</h1>
          <p className="text-muted-foreground">
            Configure and monitor webhook subscriptions for real-time event notifications
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Test Webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Test Webhook</DialogTitle>
                <DialogDescription>
                  Manually trigger a webhook for testing purposes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select value={testForm.eventType} onValueChange={(value) => setTestForm({...testForm, eventType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.name} value={type.name}>
                          {type.name} - {type.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payload">Payload (JSON)</Label>
                  <Textarea
                    id="payload"
                    placeholder='{"key": "value"}'
                    value={typeof testForm.payload === 'string' ? testForm.payload : JSON.stringify(testForm.payload, null, 2)}
                    onChange={(e) => setTestForm({...testForm, payload: e.target.value})}
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleTriggerWebhook}>
                  Trigger Webhook
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Webhook Subscription</DialogTitle>
                <DialogDescription>
                  Configure a new webhook to receive real-time event notifications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      placeholder="Webhook name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={createForm.url}
                      onChange={(e) => setCreateForm({...createForm, url: e.target.value})}
                      placeholder="https://your-endpoint.com/webhook"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Event Types</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                    {eventTypes.map((type) => (
                      <div key={type.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.name}
                          checked={createForm.eventTypes.includes(type.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCreateForm({
                                ...createForm,
                                eventTypes: [...createForm.eventTypes, type.name]
                              });
                            } else {
                              setCreateForm({
                                ...createForm,
                                eventTypes: createForm.eventTypes.filter(t => t !== type.name)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={type.name} className="text-sm">
                          {type.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="secret">Secret</Label>
                    <Input
                      id="secret"
                      type="password"
                      value={createForm.secret}
                      onChange={(e) => setCreateForm({...createForm, secret: e.target.value})}
                      placeholder="Optional secret"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxRetries">Max Retries</Label>
                    <Input
                      id="maxRetries"
                      type="number"
                      value={createForm.maxRetries}
                      onChange={(e) => setCreateForm({...createForm, maxRetries: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
                    <Input
                      id="retryDelay"
                      type="number"
                      value={createForm.retryDelay}
                      onChange={(e) => setCreateForm({...createForm, retryDelay: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label>Custom Headers</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addCustomHeader}>
                      Add Header
                    </Button>
                  </div>
                  {customHeaders.map((header, index) => (
                    <div key={index} className="flex items-center space-x-2 mt-2">
                      <Input
                        placeholder="Header name"
                        value={header.key}
                        onChange={(e) => updateCustomHeader(index, 'key', e.target.value)}
                      />
                      <Input
                        placeholder="Header value"
                        value={header.value}
                        onChange={(e) => updateCustomHeader(index, 'value', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomHeader(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSubscription}>
                  Create Webhook
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="deliveries">Delivery Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeSubscriptions} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.deliveriesLast24Hours} in last 24h
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {((stats.successfulDeliveries / stats.totalDeliveries) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.successRateLast24Hours.toFixed(1)}% last 24h
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageResponseTime}ms</div>
                  <p className="text-xs text-muted-foreground">
                    Average delivery time
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid gap-4">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{subscription.name}</span>
                        <Badge variant={subscription.isActive ? "default" : "secondary"}>
                          {subscription.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{subscription.url}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeliveryDialog(subscription)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(subscription)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSubscription(subscription.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Event Types: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {subscription.eventTypes.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Max Retries: </span>
                        {subscription.retryPolicy.maxRetries}
                      </div>
                      <div>
                        <span className="font-medium">Retry Delay: </span>
                        {subscription.retryPolicy.retryDelay}ms
                      </div>
                      <div>
                        <span className="font-medium">Created: </span>
                        {new Date(subscription.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Last Triggered: </span>
                        {subscription.lastTriggered 
                          ? new Date(subscription.lastTriggered).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deliveries</CardTitle>
              <CardDescription>
                View webhook delivery logs and retry failed deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Select a webhook subscription to view its delivery history
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Webhook Subscription</DialogTitle>
            <DialogDescription>
              Update webhook configuration and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editName">Name</Label>
                <Input
                  id="editName"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editUrl">URL</Label>
                <Input
                  id="editUrl"
                  value={editForm.url || ''}
                  onChange={(e) => setEditForm({...editForm, url: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={editForm.isActive || false}
                onCheckedChange={(checked) => setEditForm({...editForm, isActive: checked})}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div>
              <Label>Event Types</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                {eventTypes.map((type) => (
                  <div key={type.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${type.name}`}
                      checked={editForm.eventTypes?.includes(type.name) || false}
                      onCheckedChange={(checked) => {
                        const currentTypes = editForm.eventTypes || [];
                        if (checked) {
                          setEditForm({
                            ...editForm,
                            eventTypes: [...currentTypes, type.name]
                          });
                        } else {
                          setEditForm({
                            ...editForm,
                            eventTypes: currentTypes.filter(t => t !== type.name)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`edit-${type.name}`} className="text-sm">
                      {type.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubscription}>
              Update Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery History Dialog */}
      <Dialog open={isDeliveryDialogOpen} onOpenChange={setIsDeliveryDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Delivery History</DialogTitle>
            <DialogDescription>
              {selectedSubscription?.name} - Webhook delivery logs and status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {deliveries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No deliveries found for this webhook
              </div>
            ) : (
              deliveries.map((delivery) => (
                <Card key={delivery.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {delivery.isSuccessful ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">{delivery.eventType}</span>
                        <Badge variant={delivery.isSuccessful ? "default" : "destructive"}>
                          {delivery.httpStatusCode || 'Failed'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {delivery.deliveredAt 
                            ? new Date(delivery.deliveredAt).toLocaleString()
                            : new Date(delivery.failedAt!).toLocaleString()
                          }
                        </span>
                        {!delivery.isSuccessful && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetryDelivery(delivery.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {delivery.errorMessage && (
                      <div className="mt-2 text-sm text-red-600">
                        Error: {delivery.errorMessage}
                      </div>
                    )}
                    <div className="mt-2 text-sm text-muted-foreground">
                      Retries: {delivery.retryCount} / {selectedSubscription?.retryPolicy.maxRetries}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeliveryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebhooksManagementPage;
