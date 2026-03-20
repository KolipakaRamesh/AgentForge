"""
GitHub Integration for AgentForge
Handles automatic repository creation and code push
"""
import os
import base64
import logging
from github import Github, GithubException
from typing import Dict, List, Optional

# Basic logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GitHubManager:
    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN")
        if not self.token:
            # GitHub integration disabled - no token provided
            self.enabled = False
            self.g = None
            return
        
        try:
            self.g = Github(self.token)
            # Test the connection
            self.g.get_user().login
            self.enabled = True
        except Exception as e:
            self.enabled = False
            self.g = None
    
    def create_repository(self, name: str, description: str, private: bool = False) -> Optional[str]:
        """Create a new GitHub repository and return the clone URL"""
        if not self.enabled or not self.g:
            return None
            
        try:
            user = self.g.get_user()
            repo = user.create_repo(
                name=name,
                description=description,
                private=private,
                auto_init=True,
                has_issues=True,
                has_projects=True,
                has_wiki=False
            )
            logger.info(f"Created repository: {repo.full_name}")
            return repo.clone_url
        except GithubException as e:
            logger.error(f"Failed to create repository: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error creating repository: {e}")
            return None
    
    def push_files(self, repo_url: str, files: Dict[str, str], commit_message: str = "Initial commit") -> bool:
        """Push files to a GitHub repository"""
        if not self.enabled or not self.g:
            return False
        
        try:
            # Extract owner and repo name from URL
            # Format: https://github.com/username/repo.git
            parts = repo_url.rstrip('.git').split('/')
            owner = parts[-2]
            repo_name = parts[-1]
            
            repo = self.g.get_repo(f"{owner}/{repo_name}")
            
            # Prepare files for commit
            updates = []
            for file_path, content in files.items():
                # Ensure directory structure exists
                try:
                    contents = repo.get_contents(file_path)
                    # File exists, update it
                    repo.update_file(
                        path=file_path,
                        message=commit_message,
                        content=content,
                        sha=contents.sha
                    )
                except GithubException as e:
                    if e.status == 404:
                        # File doesn't exist, create it
                        repo.create_file(
                            path=file_path,
                            message=commit_message,
                            content=content
                        )
                    else:
                        raise e
            
            logger.info(f"Successfully pushed {len(files)} files to {repo.full_name}")
            return True
            
        except GithubException as e:
            logger.error(f"GitHub error pushing files: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error pushing files: {e}")
            return False
    
    def get_repository_info(self, repo_url: str) -> Optional[Dict]:
        """Get information about a repository"""
        if not self.enabled or not self.g:
            return None
            
        try:
            parts = repo_url.rstrip('.git').split('/')
            owner = parts[-2]
            repo_name = parts[-1]
            
            repo = self.g.get_repo(f"{owner}/{repo_name}")
            return {
                "name": repo.name,
                "full_name": repo.full_name,
                "description": repo.description,
                "url": repo.html_url,
                "clone_url": repo.clone_url,
                "private": repo.private,
                "created_at": repo.created_at.isoformat(),
                "updated_at": repo.updated_at.isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting repository info: {e}")
            return None

# Global instance
github_manager = GitHubManager()