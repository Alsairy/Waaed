import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  description: string;
  assignedTo?: string;
  dueDays?: number;
  isAutomated: boolean;
  configuration?: Record<string, any>;
}

interface WorkflowTemplate {
  id?: string;
  workflowType: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

const WorkflowDesignerPage: React.FC = () => {
  const [template, setTemplate] = useState<WorkflowTemplate>({
    workflowType: '',
    name: '',
    description: '',
    steps: []
  });
  const [currentStep, setCurrentStep] = useState<WorkflowStep>({
    id: '',
    name: '',
    type: 'approval',
    description: '',
    assignedTo: '',
    dueDays: 1,
    isAutomated: false,
    configuration: {}
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const stepTypes = [
    { value: 'approval', label: 'Approval' },
    { value: 'notification', label: 'Notification' },
    { value: 'calculation', label: 'Calculation' },
    { value: 'integration', label: 'Integration' },
    { value: 'review', label: 'Review' },
    { value: 'validation', label: 'Validation' }
  ];

  const workflowTypes = [
    { value: 'leave_request', label: 'Leave Request' },
    { value: 'overtime_approval', label: 'Overtime Approval' },
    { value: 'expense_approval', label: 'Expense Approval' },
    { value: 'document_approval', label: 'Document Approval' },
    { value: 'policy_review', label: 'Policy Review' },
    { value: 'performance_review', label: 'Performance Review' }
  ];

  useEffect(() => {
    loadWorkflowTemplates();
  }, []);

  const loadWorkflowTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/advancedworkflow/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTemplates(result.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading workflow templates:', error);
      toast.error('Failed to load workflow templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStep = () => {
    if (!currentStep.name || !currentStep.type) {
      toast.error('Please fill in step name and type');
      return;
    }

    const newStep = {
      ...currentStep,
      id: Date.now().toString()
    };

    if (isEditing) {
      const updatedSteps = [...template.steps];
      updatedSteps[editingIndex] = newStep;
      setTemplate({ ...template, steps: updatedSteps });
      setIsEditing(false);
      setEditingIndex(-1);
      toast.success('Step updated successfully');
    } else {
      setTemplate({
        ...template,
        steps: [...template.steps, newStep]
      });
      toast.success('Step added successfully');
    }

    setCurrentStep({
      id: '',
      name: '',
      type: 'approval',
      description: '',
      assignedTo: '',
      dueDays: 1,
      isAutomated: false,
      configuration: {}
    });
  };

  const handleEditStep = (index: number) => {
    setCurrentStep(template.steps[index]);
    setIsEditing(true);
    setEditingIndex(index);
  };

  const handleDeleteStep = (index: number) => {
    const updatedSteps = template.steps.filter((_, i) => i !== index);
    setTemplate({ ...template, steps: updatedSteps });
    toast.success('Step deleted successfully');
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= template.steps.length) return;

    const updatedSteps = [...template.steps];
    [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
    setTemplate({ ...template, steps: updatedSteps });
  };

  const handleSaveTemplate = async () => {
    if (!template.name || !template.workflowType || template.steps.length === 0) {
      toast.error('Please fill in template name, workflow type, and add at least one step');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/advancedworkflow/templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(template)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success('Workflow template saved successfully');
          await loadWorkflowTemplates();
          setTemplate({
            workflowType: '',
            name: '',
            description: '',
            steps: []
          });
        } else {
          toast.error(result.message || 'Failed to save workflow template');
        }
      } else {
        toast.error('Failed to save workflow template');
      }
    } catch (error) {
      console.error('Error saving workflow template:', error);
      toast.error('Failed to save workflow template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadTemplate = (templateToLoad: WorkflowTemplate) => {
    setTemplate(templateToLoad);
    toast.success('Template loaded successfully');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Designer</h1>
          <p className="text-gray-600">Design and customize workflow templates</p>
        </div>
        <button
          onClick={handleSaveTemplate}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Template'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Template Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Type
                </label>
                <select
                  value={template.workflowType}
                  onChange={(e) => setTemplate({ ...template, workflowType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select workflow type</option>
                  {workflowTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={template.description}
                onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter template description"
              />
            </div>
          </div>

          {/* Step Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Step' : 'Add Step'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step Name
                </label>
                <input
                  type="text"
                  value={currentStep.name}
                  onChange={(e) => setCurrentStep({ ...currentStep, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter step name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step Type
                </label>
                <select
                  value={currentStep.type}
                  onChange={(e) => setCurrentStep({ ...currentStep, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {stepTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To (Role/User)
                </label>
                <input
                  type="text"
                  value={currentStep.assignedTo}
                  onChange={(e) => setCurrentStep({ ...currentStep, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., manager, hr, admin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Days
                </label>
                <input
                  type="number"
                  value={currentStep.dueDays}
                  onChange={(e) => setCurrentStep({ ...currentStep, dueDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={currentStep.description}
                onChange={(e) => setCurrentStep({ ...currentStep, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter step description"
              />
            </div>
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="isAutomated"
                checked={currentStep.isAutomated}
                onChange={(e) => setCurrentStep({ ...currentStep, isAutomated: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isAutomated" className="ml-2 block text-sm text-gray-900">
                Automated Step
              </label>
            </div>
            <div className="mt-4">
              <button
                onClick={handleAddStep}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                {isEditing ? 'Update Step' : 'Add Step'}
              </button>
              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingIndex(-1);
                    setCurrentStep({
                      id: '',
                      name: '',
                      type: 'approval',
                      description: '',
                      assignedTo: '',
                      dueDays: 1,
                      isAutomated: false,
                      configuration: {}
                    });
                  }}
                  className="ml-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Workflow Steps</h2>
            {template.steps.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No steps added yet. Add your first step above.</p>
            ) : (
              <div className="space-y-4">
                {template.steps.map((step, index) => (
                  <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                          Step {index + 1}
                        </span>
                        <div>
                          <h3 className="font-medium">{step.name}</h3>
                          <p className="text-sm text-gray-600">{step.type} • {step.assignedTo || 'Unassigned'}</p>
                        </div>
                        {step.isAutomated && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            Automated
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleMoveStep(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveStep(index, 'down')}
                          disabled={index === template.steps.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => handleEditStep(index)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStep(index)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {step.description && (
                      <p className="mt-2 text-sm text-gray-600">{step.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Existing Templates */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Existing Templates</h2>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : templates.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No templates found</p>
            ) : (
              <div className="space-y-3">
                {templates.map((tmpl) => (
                  <div key={tmpl.id} className="border border-gray-200 rounded-lg p-3">
                    <h3 className="font-medium">{tmpl.name}</h3>
                    <p className="text-sm text-gray-600">{tmpl.workflowType}</p>
                    <p className="text-xs text-gray-500 mt-1">{tmpl.steps?.length || 0} steps</p>
                    <button
                      onClick={() => handleLoadTemplate(tmpl)}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Load Template
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workflow Preview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Workflow Preview</h2>
            {template.steps.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Add steps to see preview</p>
            ) : (
              <div className="space-y-2">
                {template.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{step.name}</p>
                      <p className="text-xs text-gray-500">{step.type}</p>
                    </div>
                    {index < template.steps.length - 1 && (
                      <div className="w-px h-4 bg-gray-300"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDesignerPage;
