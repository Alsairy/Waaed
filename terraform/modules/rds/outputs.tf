output "endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.default.endpoint
}

output "port" {
  description = "RDS instance port"
  value       = aws_db_instance.default.port
}

output "db_instance_id" {
  description = "RDS instance ID"
  value       = aws_db_instance.default.id
}

output "db_instance_arn" {
  description = "RDS instance ARN"
  value       = aws_db_instance.default.arn
}

output "db_instance_availability_zone" {
  description = "RDS instance availability zone"
  value       = aws_db_instance.default.availability_zone
}

output "db_instance_backup_retention_period" {
  description = "RDS instance backup retention period"
  value       = aws_db_instance.default.backup_retention_period
}

output "db_instance_backup_window" {
  description = "RDS instance backup window"
  value       = aws_db_instance.default.backup_window
}

output "db_instance_maintenance_window" {
  description = "RDS instance maintenance window"
  value       = aws_db_instance.default.maintenance_window
}

output "db_instance_multi_az" {
  description = "RDS instance Multi-AZ"
  value       = aws_db_instance.default.multi_az
}
