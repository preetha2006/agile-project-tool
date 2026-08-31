from enum import Enum

class ProjectStatus(str, Enum):
    active = "active"
    on_hold = "on_hold"
    completed = "completed"
    archived = "archived"

class StoryStatus(str, Enum):
    backlog = "backlog"
    in_sprint = "in_sprint"
    in_progress = "in_progress"
    in_review = "in_review"
    done = "done"

class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    in_review = "in_review"
    done = "done"

class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class SprintStatus(str, Enum):
    planning = "planning"
    active = "active"
    completed = "completed"

class ReportStatus(str, Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"

STORY_POINTS = [1, 2, 3, 5, 8]
