variable "environment" {
  type        = string
  description = "Deployment environment name (test/stage/prod)"
}

variable "project_name" {
  type        = string
  description = "Project prefix used for resource naming"
}
