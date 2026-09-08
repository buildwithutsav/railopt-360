from typing import List, Literal
from pydantic import BaseModel, Field


Department = Literal["ENGINEERING", "TRACTION", "SNT"]


class MaintenanceTaskInput(BaseModel):
    id: str
    department: Department
    section_id: str
    km: float

    maintenance_type: str

    priority_score: int = Field(ge=0, le=100)

    estimated_duration_minutes: int = Field(gt=0)

    required_resource_ids: List[str]


class BlockWindowInput(BaseModel):
    id: str
    section_id: str

    start_time: str
    end_time: str

    duration_minutes: int = Field(gt=0)


class OptimizationRequest(BaseModel):
    tasks: List[MaintenanceTaskInput]

    block: BlockWindowInput

    max_parallel_tasks: int = Field(
        default=3,
        ge=1,
    )
    unavailable_resource_ids: List[str] = []


class ScheduledTask(BaseModel):
    task_id: str

    start_minute: int
    end_minute: int

    selected: bool


class OptimizationResponse(BaseModel):
    status: Literal[
        "OPTIMAL",
        "FEASIBLE",
        "INFEASIBLE",
        "UNKNOWN",
    ]

    selected_task_ids: List[str]

    scheduled_tasks: List[ScheduledTask]

    total_priority_value: int
    block_duration_minutes: int

    objective_value: float