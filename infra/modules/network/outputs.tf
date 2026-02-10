output "module_id" {
  value       = "${var.project_name}-${var.environment}"
  description = "Common identifier for downstream modules"
}
