terraform {
  required_version = ">= 1.8.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "network" {
  source      = "../../modules/network"
  environment = "test"
  project_name = var.project_name
}

module "alb" {
  source      = "../../modules/alb"
  environment = "test"
  project_name = var.project_name
}

module "ecs_service" {
  source      = "../../modules/ecs_service"
  environment = "test"
  project_name = var.project_name
}

module "rds_postgres" {
  source      = "../../modules/rds_postgres"
  environment = "test"
  project_name = var.project_name
}

module "dns_acm" {
  source      = "../../modules/dns_acm"
  environment = "test"
  project_name = var.project_name
}

module "secrets" {
  source      = "../../modules/secrets"
  environment = "test"
  project_name = var.project_name
}

module "observability" {
  source      = "../../modules/observability"
  environment = "test"
  project_name = var.project_name
}
