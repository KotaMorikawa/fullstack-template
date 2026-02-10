terraform {
  backend "s3" {
    bucket         = "myapp-terraform-state"
    key            = "myapp/prod/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "myapp-terraform-lock"
    encrypt        = true
  }
}
