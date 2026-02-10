output "network_module_id" {
  value       = module.network.module_id
  description = "Network module identifier"
}

output "ecs_module_id" {
  value       = module.ecs_service.module_id
  description = "ECS module identifier"
}

output "rds_module_id" {
  value       = module.rds_postgres.module_id
  description = "RDS module identifier"
}
