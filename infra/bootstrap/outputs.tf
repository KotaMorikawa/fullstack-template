output "state_bucket_name" {
  value       = aws_s3_bucket.terraform_state.bucket
  description = "Terraform state bucket name"
}

output "lock_table_name" {
  value       = aws_dynamodb_table.terraform_lock.name
  description = "Terraform lock table name"
}
