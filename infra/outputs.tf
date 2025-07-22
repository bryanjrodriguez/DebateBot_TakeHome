output "ecr_repository_url" {
  value = aws_ecr_repository.app_repo.repository_url
}

output "service_url_hint" {
  value = "This ECS service is running. Find the public IP via ECS console or CloudWatch logs."
}