using System.ComponentModel.DataAnnotations;

namespace AttendancePlatform.Shared.Domain.DTOs
{
    public class WorkflowExecutionMetricsDto
    {
        public int TotalWorkflows { get; set; }
        public int CompletedWorkflows { get; set; }
        public int FailedWorkflows { get; set; }
        public int RunningWorkflows { get; set; }
        public double SuccessRate { get; set; }
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
    }
}
