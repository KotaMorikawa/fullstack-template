variable "aws_region" {
  type        = string
  description = "AWS region for backend bootstrap resources"
}

variable "project_name" {
  type        = string
  description = "Project prefix used for backend resources"
}

variable "state_bucket_name" {
  type        = string
  description = "S3 bucket name used for Terraform state"
}

variable "lock_table_name" {
  type        = string
  description = "DynamoDB table name used for Terraform lock"
}
