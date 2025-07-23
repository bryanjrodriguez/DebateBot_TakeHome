variable "region" {
  description = "AWS region"
  type        = string
}

variable "app_name" {
  description = "Name of the application"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
}

variable "container_port" {
  description = "Port exposed by the container"
  type        = number
}

variable "supabase_url" {
  description = "Supabase URL for the application"
  type        = string
  sensitive   = true
}

variable "supabase_key" {
  description = "Supabase API key"
  type        = string
  sensitive   = true
}

variable "google_api_key" {
  description = "Google API key"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Main domain name (e.g., example.com)"
  type        = string
}

variable "api_subdomain" {
  description = "Subdomain for the API (e.g., api)"
  type        = string
  default     = "api"
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
  sensitive   = true
}
