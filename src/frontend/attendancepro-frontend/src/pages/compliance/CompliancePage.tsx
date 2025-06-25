import React, { useState, useEffect } from 'react';
import { FileText, Shield, AlertTriangle, CheckCircle, XCircle, Download, TrendingUp, Calendar } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';

import { Alert, AlertDescription } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';

import complianceService, {
  ComplianceDashboard,
  ComplianceViolation,
  RegionalRequirement,
  ComplianceTrend,
  GenerateReportRequest,
  ExportReportRequest
} from '../../services/complianceService';

const CompliancePage: React.FC = () => {
  const [dashboard, setDashboard] = useState<ComplianceDashboard | null>(null);
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [requirements, setRequirements] = useState<RegionalRequirement[]>([]);
  const [trends, setTrends] = useState<ComplianceTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [selectedTenantId] = useState('00000000-0000-0000-0000-000000000001'); // Default tenant
  
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isViolationDialogOpen, setIsViolationDialogOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<ComplianceViolation | null>(null);

  const [reportForm, setReportForm] = useState<GenerateReportRequest>({
    tenantId: selectedTenantId,
    region: selectedRegion,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    language: 'en'
  });

  const [exportForm] = useState<ExportReportRequest>({
    region: selectedRegion,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'pdf',
    language: 'en'
  });

  const [resolutionNotes, setResolutionNotes] = useState('');

  const regions = [
    { code: 'US', name: 'United States' },
    { code: 'EU', name: 'European Union' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'SA', name: 'Saudi Arabia' }
  ];

  useEffect(() => {
    loadData();
  }, [selectedRegion]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardData, violationsData, requirementsData, trendsData] = await Promise.all([
        complianceService.getComplianceDashboard(selectedTenantId, selectedRegion),
        complianceService.getComplianceViolations(
          selectedTenantId,
          selectedRegion,
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        ),
        complianceService.getRegionalRequirements(selectedRegion),
        complianceService.getComplianceTrends(selectedTenantId, selectedRegion, 30)
      ]);

      setDashboard(dashboardData);
      setViolations(violationsData);
      setRequirements(requirementsData);
      setTrends(trendsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const report = await complianceService.generateComplianceReport(reportForm);
      setIsReportDialogOpen(false);
      
      const reportData = JSON.stringify(report, null, 2);
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance-report-${report.region}-${report.generatedAt.split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleExportReport = async () => {
    try {
      const blob = await complianceService.exportComplianceReport(selectedTenantId, exportForm);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance-export-${exportForm.region}-${exportForm.startDate}-${exportForm.endDate}.${exportForm.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResolveViolation = async () => {
    if (!selectedViolation) return;

    try {
      await complianceService.resolveViolation(selectedViolation.id, resolutionNotes);
      setIsViolationDialogOpen(false);
      setSelectedViolation(null);
      setResolutionNotes('');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'destructive';
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getComplianceStatusColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Management</h1>
          <p className="text-muted-foreground">
            Monitor regulatory compliance and manage audit requirements
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.code} value={region.code}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Compliance Report</DialogTitle>
                <DialogDescription>
                  Create a comprehensive compliance report for the selected period
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={reportForm.startDate}
                      onChange={(e) => setReportForm({...reportForm, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={reportForm.endDate}
                      onChange={(e) => setReportForm({...reportForm, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={reportForm.language} onValueChange={(value) => setReportForm({...reportForm, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateReport}>
                  Generate Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {dashboard && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getComplianceStatusColor(dashboard.status.complianceScore)}`}>
                      {dashboard.status.complianceScore.toFixed(1)}%
                    </div>
                    <Progress value={dashboard.status.complianceScore} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboard.summary.totalViolations}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboard.summary.criticalViolations} critical
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last Review</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Date(dashboard.summary.lastReviewDate).toLocaleDateString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Next: {new Date(dashboard.summary.nextReviewDate).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                    {dashboard.status.overallStatus === 'Compliant' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      <Badge variant={dashboard.status.overallStatus === 'Compliant' ? 'default' : 'destructive'}>
                        {dashboard.status.overallStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dashboard.status.criticalIssues} critical issues
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Violations</CardTitle>
                    <CardDescription>Latest compliance violations requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboard.recentViolations.slice(0, 5).map((violation) => (
                        <div key={violation.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant={getSeverityColor(violation.severity)}>
                              {violation.severity}
                            </Badge>
                            <span className="text-sm">{violation.violationType}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(violation.detectedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {dashboard.recentViolations.length === 0 && (
                        <p className="text-sm text-muted-foreground">No recent violations</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Regional Requirements</CardTitle>
                    <CardDescription>Compliance requirements for {selectedRegion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboard.requirements.slice(0, 5).map((requirement) => (
                        <div key={requirement.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant={requirement.mandatory ? 'default' : 'secondary'}>
                              {requirement.mandatory ? 'Mandatory' : 'Optional'}
                            </Badge>
                            <span className="text-sm">{requirement.category}</span>
                          </div>
                          <Badge variant={
                            requirement.complianceLevel === 'Full' ? 'default' :
                            requirement.complianceLevel === 'Partial' ? 'secondary' : 'destructive'
                          }>
                            {requirement.complianceLevel}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Violations</CardTitle>
              <CardDescription>
                Review and resolve compliance violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {violations.map((violation) => (
                  <Card key={violation.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant={getSeverityColor(violation.severity)}>
                              {violation.severity}
                            </Badge>
                            <span className="font-medium">{violation.violationType}</span>
                            {violation.isResolved && (
                              <Badge variant="default">Resolved</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{violation.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>User: {violation.userName || violation.userId}</span>
                            <span>Detected: {new Date(violation.detectedAt).toLocaleString()}</span>
                            {violation.resolvedAt && (
                              <span>Resolved: {new Date(violation.resolvedAt).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        {!violation.isResolved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedViolation(violation);
                              setIsViolationDialogOpen(true);
                            }}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {violations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No violations found for the selected period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regional Requirements</CardTitle>
              <CardDescription>
                Compliance requirements for {regions.find(r => r.code === selectedRegion)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requirements.map((requirement) => (
                  <Card key={requirement.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant={requirement.mandatory ? 'default' : 'secondary'}>
                              {requirement.mandatory ? 'Mandatory' : 'Optional'}
                            </Badge>
                            <span className="font-medium">{requirement.category}</span>
                          </div>
                          <Badge variant={
                            requirement.complianceLevel === 'Full' ? 'default' :
                            requirement.complianceLevel === 'Partial' ? 'secondary' : 'destructive'
                          }>
                            {requirement.complianceLevel}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{requirement.requirement}</h4>
                        <p className="text-sm text-muted-foreground">{requirement.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Effective: {new Date(requirement.effectiveDate).toLocaleDateString()}</span>
                          {requirement.expiryDate && (
                            <span>Expires: {new Date(requirement.expiryDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trends</CardTitle>
              <CardDescription>
                Historical compliance data and trends analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends.length > 0 ? (
                  <div className="grid gap-4">
                    {trends.slice(-7).map((trend) => (
                      <div key={trend.date} className="flex items-center justify-between p-4 border rounded">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">{new Date(trend.date).toLocaleDateString()}</span>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className={`font-medium ${getComplianceStatusColor(trend.complianceScore)}`}>
                              {trend.complianceScore.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{trend.violationCount} violations</span>
                          <span>{trend.criticalViolations} critical</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No trend data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>
                Configure compliance settings for {regions.find(r => r.code === selectedRegion)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Regional settings configuration will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resolve Violation Dialog */}
      <Dialog open={isViolationDialogOpen} onOpenChange={setIsViolationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Violation</DialogTitle>
            <DialogDescription>
              Provide resolution notes for this compliance violation
            </DialogDescription>
          </DialogHeader>
          {selectedViolation && (
            <div className="space-y-4">
              <div>
                <Label>Violation Type</Label>
                <p className="text-sm">{selectedViolation.violationType}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm">{selectedViolation.description}</p>
              </div>
              <div>
                <Label htmlFor="resolutionNotes">Resolution Notes</Label>
                <Textarea
                  id="resolutionNotes"
                  placeholder="Describe how this violation was resolved..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViolationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolveViolation} disabled={!resolutionNotes.trim()}>
              Resolve Violation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompliancePage;
