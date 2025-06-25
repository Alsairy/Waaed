import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Search, 
  Plus, 
  Download, 
  Users, 
  BarChart3, 
  Palette, 
  Building,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';


import tenantManagementService, { 
  Tenant, 
  CreateTenantRequest, 
  UpdateTenantRequest,
  TenantSearchFilters,
  TenantListResponse,
  TenantAnalytics,
  TenantUsageReport
} from '@/services/tenantManagementService';

const createTenantSchema = z.object({
  name: z.string().min(1, 'Tenant name is required'),
  domain: z.string().min(1, 'Domain is required'),
  subdomain: z.string().min(1, 'Subdomain is required'),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().min(1, 'Timezone is required'),
  currency: z.string().min(1, 'Currency is required'),
  language: z.string().min(1, 'Language is required'),
  subscriptionPlan: z.enum(['Basic', 'Professional', 'Enterprise', 'Custom']),
  maxUsers: z.number().min(1, 'Max users must be at least 1'),
  features: z.array(z.string()).min(1, 'At least one feature must be selected'),
  customBranding: z.any().optional(),
  settings: z.any().optional(),
});

const updateTenantSchema = z.object({
  name: z.string().min(1, 'Tenant name is required').optional(),
  domain: z.string().min(1, 'Domain is required').optional(),
  contactEmail: z.string().email('Invalid email address').optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  subscriptionPlan: z.enum(['Basic', 'Professional', 'Enterprise', 'Custom']).optional(),
  maxUsers: z.number().min(1, 'Max users must be at least 1').optional(),
  features: z.array(z.string()).optional(),
  customBranding: z.any().optional(),
  settings: z.any().optional(),
});

const brandingSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  primaryColor: z.string().min(1, 'Primary color is required'),
  secondaryColor: z.string().min(1, 'Secondary color is required'),
  accentColor: z.string().min(1, 'Accent color is required'),
  fontFamily: z.string().min(1, 'Font family is required'),
  tagline: z.string().optional(),
  customCss: z.string().optional(),
});

const TenantManagementPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TenantSearchFilters>({});
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [, setShowEditDialog] = useState(false);
  const [, setShowBrandingDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantAnalytics, setTenantAnalytics] = useState<TenantAnalytics | null>(null);
  const [tenantUsage, setTenantUsage] = useState<TenantUsageReport | null>(null);
  const [availableFeatures, setAvailableFeatures] = useState<Array<{ id: string; name: string; description: string; category: string }>>([]);
  const [, setSubscriptionPlans] = useState<Array<{ id: string; name: string; description: string; price: number; features: string[] }>>([]);
  const [tenantStats, setTenantStats] = useState<any>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 0,
  });

  const createForm = useForm<CreateTenantRequest>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      features: [],
      maxUsers: 10,
      subscriptionPlan: 'Basic',
      timezone: 'UTC',
      currency: 'USD',
      language: 'en',
    },
  });

  const editForm = useForm<UpdateTenantRequest>({
    resolver: zodResolver(updateTenantSchema),
  });

  const brandingForm = useForm({
    resolver: zodResolver(brandingSchema),
  });

  useEffect(() => {
    loadTenants();
    loadAvailableFeatures();
    loadSubscriptionPlans();
    loadTenantStats();
  }, [filters, pagination.page, pagination.pageSize]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const searchFilters: TenantSearchFilters = {
        ...filters,
        search: searchTerm,
        page: pagination.page,
        pageSize: pagination.pageSize,
      };
      
      const response: TenantListResponse = await tenantManagementService.getTenants(searchFilters);
      setTenants(response.tenants);
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
      }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableFeatures = async () => {
    try {
      const features = await tenantManagementService.getAvailableFeatures();
      setAvailableFeatures(features);
    } catch (error: any) {
      toast.error('Failed to load available features');
    }
  };

  const loadSubscriptionPlans = async () => {
    try {
      const plans = await tenantManagementService.getSubscriptionPlans();
      setSubscriptionPlans(plans);
    } catch (error: any) {
      toast.error('Failed to load subscription plans');
    }
  };

  const loadTenantStats = async () => {
    try {
      const stats = await tenantManagementService.getTenantStats();
      setTenantStats(stats);
    } catch (error: any) {
      toast.error('Failed to load tenant statistics');
    }
  };

  const loadTenantAnalytics = async (tenantId: string) => {
    try {
      const analytics = await tenantManagementService.getTenantAnalytics(tenantId, '30d');
      setTenantAnalytics(analytics);
      
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const usage = await tenantManagementService.getTenantUsageReport(tenantId, startDate, endDate);
      setTenantUsage(usage);
    } catch (error: any) {
      toast.error('Failed to load tenant analytics');
    }
  };

  const handleCreateTenant = async (data: CreateTenantRequest) => {
    try {
      await tenantManagementService.createTenant(data);
      toast.success('Tenant created successfully');
      setShowCreateDialog(false);
      createForm.reset();
      loadTenants();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create tenant');
    }
  };



  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return;
    }
    
    try {
      await tenantManagementService.deleteTenant(tenantId);
      toast.success('Tenant deleted successfully');
      loadTenants();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete tenant');
    }
  };

  const handleStatusChange = async (tenantId: string, status: 'Active' | 'Inactive' | 'Suspended' | 'Trial') => {
    try {
      await tenantManagementService.updateTenantStatus(tenantId, status);
      toast.success('Tenant status updated successfully');
      loadTenants();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tenant status');
    }
  };

  const handleExportTenants = async () => {
    try {
      const blob = await tenantManagementService.exportTenants(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'tenants.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Tenants exported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export tenants');
    }
  };

  const openEditDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    editForm.reset({
      name: tenant.name,
      domain: tenant.domain,
      contactEmail: tenant.contactEmail,
      contactPhone: tenant.contactPhone,
      address: tenant.address,
      city: tenant.city,
      country: tenant.country,
      timezone: tenant.timezone,
      currency: tenant.currency,
      language: tenant.language,
      subscriptionPlan: tenant.subscriptionPlan,
      maxUsers: tenant.maxUsers,
      features: tenant.features,
    });
    setShowEditDialog(true);
  };

  const openBrandingDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    brandingForm.reset({
      companyName: tenant.customBranding.companyName,
      primaryColor: tenant.customBranding.primaryColor,
      secondaryColor: tenant.customBranding.secondaryColor,
      accentColor: tenant.customBranding.accentColor,
      fontFamily: tenant.customBranding.fontFamily,
      tagline: tenant.customBranding.tagline,
      customCss: tenant.customBranding.customCss,
    });
    setShowBrandingDialog(true);
  };

  const openAnalyticsDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    loadTenantAnalytics(tenant.id);
    setShowAnalyticsDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      Inactive: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      Suspended: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      Trial: { color: 'bg-blue-100 text-blue-800', icon: Activity },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Inactive;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const planColors = {
      Basic: 'bg-gray-100 text-gray-800',
      Professional: 'bg-blue-100 text-blue-800',
      Enterprise: 'bg-purple-100 text-purple-800',
      Custom: 'bg-orange-100 text-orange-800',
    };
    
    return (
      <Badge className={planColors[plan as keyof typeof planColors] || planColors.Basic}>
        {plan}
      </Badge>
    );
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenant Management</h1>
          <p className="text-muted-foreground">
            Manage multi-tenant organizations and their configurations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportTenants}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Tenant
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {tenantStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenantStats.totalTenants}</div>
              <p className="text-xs text-muted-foreground">
                +{tenantStats.newTenantsThisMonth} this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenantStats.activeTenants}</div>
              <p className="text-xs text-muted-foreground">
                {((tenantStats.activeTenants / tenantStats.totalTenants) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenantStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Across all tenants
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${tenantStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Monthly recurring revenue
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant Directory</CardTitle>
          <CardDescription>
            All registered tenants and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filters.status || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Trial">Trial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.subscriptionPlan || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, subscriptionPlan: value as any }))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setFilters({})}>
              Clear Filters
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading tenants...</div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-8">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No tenants found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedTenants.length === filteredTenants.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTenants(filteredTenants.map(t => t.id));
                          } else {
                            setSelectedTenants([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTenants.includes(tenant.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTenants(prev => [...prev, tenant.id]);
                            } else {
                              setSelectedTenants(prev => prev.filter(id => id !== tenant.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={tenant.customBranding.logoUrl} />
                            <AvatarFallback>
                              {tenant.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{tenant.name}</div>
                            <div className="text-sm text-muted-foreground">{tenant.domain}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tenant.contactEmail}</div>
                          {tenant.contactPhone && (
                            <div className="text-sm text-muted-foreground">{tenant.contactPhone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(tenant.subscriptionPlan)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {tenant.currentUsers} / {tenant.maxUsers}
                        </div>
                        <Progress 
                          value={(tenant.currentUsers / tenant.maxUsers) * 100} 
                          className="w-16 h-2 mt-1"
                        />
                      </TableCell>
                      <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                      <TableCell>
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openAnalyticsDialog(tenant)}>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(tenant)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Tenant
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openBrandingDialog(tenant)}>
                              <Palette className="mr-2 h-4 w-4" />
                              Customize Branding
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(tenant.id, tenant.status === 'Active' ? 'Inactive' : 'Active')}
                            >
                              {tenant.status === 'Active' ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTenant(tenant.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Tenant Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Tenant</DialogTitle>
            <DialogDescription>
              Add a new tenant organization to the platform
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateTenant)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain</FormLabel>
                      <FormControl>
                        <Input placeholder="acme.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subdomain</FormLabel>
                      <FormControl>
                        <Input placeholder="acme" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@acme.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="subscriptionPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Plan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Basic">Basic</SelectItem>
                          <SelectItem value="Professional">Professional</SelectItem>
                          <SelectItem value="Enterprise">Enterprise</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="maxUsers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Users</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={createForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="SAR">SAR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="features"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Features</FormLabel>
                      <FormDescription>
                        Select the features available for this tenant
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {availableFeatures.map((feature) => (
                        <FormField
                          key={feature.id}
                          control={createForm.control}
                          name="features"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={feature.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(feature.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, feature.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value: string) => value !== feature.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {feature.name}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Tenant</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tenant Analytics - {selectedTenant?.name}</DialogTitle>
            <DialogDescription>
              Usage analytics and performance metrics for the last 30 days
            </DialogDescription>
          </DialogHeader>
          
          {tenantAnalytics && tenantUsage && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{tenantAnalytics.totalUsers}</div>
                      <p className="text-xs text-muted-foreground">
                        {tenantAnalytics.activeUsers} active
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Attendance Records</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{tenantAnalytics.totalAttendanceRecords}</div>
                      <p className="text-xs text-muted-foreground">
                        This period
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Working Hours</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{tenantAnalytics.averageWorkingHours.toFixed(1)}h</div>
                      <p className="text-xs text-muted-foreground">
                        Per day
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{tenantAnalytics.leaveRequests}</div>
                      <p className="text-xs text-muted-foreground">
                        {tenantAnalytics.approvedLeaves} approved
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="usage" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>API Calls</span>
                          <span className="font-medium">{tenantAnalytics.systemUsage.apiCalls.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage Used</span>
                          <span className="font-medium">{(tenantAnalytics.systemUsage.storageUsed / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bandwidth Used</span>
                          <span className="font-medium">{(tenantAnalytics.systemUsage.bandwidthUsed / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Billing Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Current Plan</span>
                          <span className="font-medium">{tenantUsage.billingMetrics.currentPlan}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Amount</span>
                          <span className="font-medium">${tenantUsage.billingMetrics.monthlyAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Usage Overages</span>
                          <span className="font-medium">${tenantUsage.billingMetrics.usageOverages}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Next Billing</span>
                          <span className="font-medium">{new Date(tenantUsage.billingMetrics.nextBillingDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{tenantAnalytics.performanceMetrics.averageResponseTime}ms</div>
                      <p className="text-xs text-muted-foreground">Average</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Uptime</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{(tenantAnalytics.performanceMetrics.uptime * 100).toFixed(2)}%</div>
                      <p className="text-xs text-muted-foreground">This period</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Error Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{(tenantAnalytics.performanceMetrics.errorRate * 100).toFixed(2)}%</div>
                      <p className="text-xs text-muted-foreground">Of requests</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantManagementPage;
