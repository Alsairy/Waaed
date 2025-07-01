output "endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_cluster.default.cache_nodes[0].address
}

output "port" {
  description = "Redis cluster port"
  value       = aws_elasticache_cluster.default.cache_nodes[0].port
}

output "cluster_id" {
  description = "Redis cluster ID"
  value       = aws_elasticache_cluster.default.cluster_id
}

output "cluster_address" {
  description = "Redis cluster address"
  value       = aws_elasticache_cluster.default.cluster_address
}

output "configuration_endpoint" {
  description = "Redis cluster configuration endpoint"
  value       = aws_elasticache_cluster.default.configuration_endpoint
}
