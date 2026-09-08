from ortools.sat.python import cp_model

from models import (
    OptimizationRequest,
    OptimizationResponse,
    ScheduledTask,
)


def optimize_block(
    request: OptimizationRequest,
) -> OptimizationResponse:
    model = cp_model.CpModel()

    block_duration = request.block.duration_minutes

    task_vars = {}

    for task in request.tasks:
        selected = model.NewBoolVar(
            f"selected_{task.id}"
        )

        start = model.NewIntVar(
            0,
            block_duration,
            f"start_{task.id}",
        )

        end = model.NewIntVar(
            0,
            block_duration,
            f"end_{task.id}",
        )

        interval = model.NewOptionalIntervalVar(
            start,
            task.estimated_duration_minutes,
            end,
            selected,
            f"interval_{task.id}",
        )

        task_vars[task.id] = {
            "task": task,
            "selected": selected,
            "start": start,
            "end": end,
            "interval": interval,
        }

    # ---------------------------------
    # Constraint 1:
    # Task must belong to the same
    # planning section as the block.
    # ---------------------------------
    for task_id, values in task_vars.items():
        task = values["task"]

        if task.section_id != request.block.section_id:
            model.Add(
                values["selected"] == 0
            )

                # ---------------------------------
    # Constraint:
    # Resource availability
    #
    # If a task requires a resource that
    # is currently unavailable, that task
    # cannot be selected.
    # ---------------------------------

    unavailable_resources = set(
        request.unavailable_resource_ids
    )

    for values in task_vars.values():
        task = values["task"]

        requires_unavailable_resource = any(
            resource_id in unavailable_resources
            for resource_id in task.required_resource_ids
        )

        if requires_unavailable_resource:
            model.Add(
                values["selected"] == 0
            )

    # ---------------------------------
    # Constraint 2:
    # Resource conflicts
    #
    # Tasks requiring the same resource
    # cannot overlap.
    # ---------------------------------
    resource_intervals = {}

    for values in task_vars.values():
        task = values["task"]

        for resource_id in task.required_resource_ids:
            resource_intervals.setdefault(
                resource_id,
                [],
            ).append(
                values["interval"]
            )

    for intervals in resource_intervals.values():
        if len(intervals) > 1:
            model.AddNoOverlap(intervals)

                # ---------------------------------
    # Constraint 3:
    # Prototype concurrency /
    # dependency rules
    #
    # IMPORTANT:
    # These are synthetic prototype
    # assumptions for RAILOPT 360.
    # They are NOT official Indian
    # Railways operating/safety rules.
    # ---------------------------------

    task_ids = set(task_vars.keys())

    # ENG-024 -> OHE-011
    # If both tasks are selected,
    # OHE work may start only after
    # Engineering work has progressed
    # for at least 30 minutes.
    if "ENG-024" in task_ids and "OHE-011" in task_ids:
        eng = task_vars["ENG-024"]
        ohe = task_vars["OHE-011"]

        eng_ohe_both_selected = model.NewBoolVar(
            "eng024_ohe011_both_selected"
        )

        model.Add(
            eng_ohe_both_selected <= eng["selected"]
        )

        model.Add(
            eng_ohe_both_selected <= ohe["selected"]
        )

        model.Add(
            eng_ohe_both_selected
            >= eng["selected"] + ohe["selected"] - 1
        )

        model.Add(
            ohe["start"] >= eng["start"] + 30
        ).OnlyEnforceIf(
            eng_ohe_both_selected
        )

    # ENG-024 -> SNT-018
    # If both tasks are selected,
    # S&T testing may start after
    # Engineering work has progressed
    # for at least 15 minutes.
    if "ENG-024" in task_ids and "SNT-018" in task_ids:
        eng = task_vars["ENG-024"]
        snt = task_vars["SNT-018"]

        eng_snt_both_selected = model.NewBoolVar(
            "eng024_snt018_both_selected"
        )

        model.Add(
            eng_snt_both_selected <= eng["selected"]
        )

        model.Add(
            eng_snt_both_selected <= snt["selected"]
        )

        model.Add(
            eng_snt_both_selected
            >= eng["selected"] + snt["selected"] - 1
        )

        model.Add(
            snt["start"] >= eng["start"] + 15
        ).OnlyEnforceIf(
            eng_snt_both_selected
        )

    # ---------------------------------
    # Constraint 4:
    # Maximum number of tasks that
    # may run simultaneously.
    # ---------------------------------
    intervals = [
        values["interval"]
        for values in task_vars.values()
    ]

    demands = [
        1 for _ in intervals
    ]

    if intervals:
        model.AddCumulative(
            intervals,
            demands,
            request.max_parallel_tasks,
        )

    # ---------------------------------
    # Objective:
    # maximize maintenance priority
    # while slightly preferring
    # shorter occupied schedules.
    # ---------------------------------
    objective_terms = []

    for values in task_vars.values():
        task = values["task"]
        selected = values["selected"]

        objective_terms.append(
            task.priority_score * selected
        )

        # ---------------------------------
    # Multi-objective optimization:
    # 1. Maximize maintenance priority
    # 2. Prefer earlier block completion
    # ---------------------------------

    total_priority = sum(
        values["task"].priority_score * values["selected"]
        for values in task_vars.values()
    )

    overall_end = model.NewIntVar(
        0,
        request.block.duration_minutes,
        "overall_end",
    )

    for values in task_vars.values():
        model.Add(
            overall_end >= values["end"]
        ).OnlyEnforceIf(
            values["selected"]
        )

    # Priority has much greater weight than
    # completion time, so task selection remains
    # the primary optimization objective.
    model.Maximize(
        total_priority * 1000 - overall_end
    )

    # ---------------------------------
    # Solve
    # ---------------------------------
    solver = cp_model.CpSolver()

    solver.parameters.max_time_in_seconds = 5.0
    solver.parameters.num_search_workers = 8

    status = solver.Solve(model)

    status_map = {
        cp_model.OPTIMAL: "OPTIMAL",
        cp_model.FEASIBLE: "FEASIBLE",
        cp_model.INFEASIBLE: "INFEASIBLE",
        cp_model.UNKNOWN: "UNKNOWN",
    }

    result_status = status_map.get(
        status,
        "UNKNOWN",
    )

    if status not in (
        cp_model.OPTIMAL,
        cp_model.FEASIBLE,
    ):
        return OptimizationResponse(
            status=result_status,
            selected_task_ids=[],
            scheduled_tasks=[],
            total_priority_value=0,
            block_duration_minutes=block_duration,
            objective_value=0,
        )

    selected_task_ids = []
    scheduled_tasks = []
    total_priority_value = 0

    for task_id, values in task_vars.items():
        task = values["task"]
        selected_value = bool(
            solver.Value(
                values["selected"]
            )
        )

        if selected_value:
            selected_task_ids.append(
                task_id
            )

            total_priority_value += (
                task.priority_score
            )

            start_value = solver.Value(
                values["start"]
            )

            end_value = solver.Value(
                values["end"]
            )

        else:
            start_value = 0
            end_value = 0

        scheduled_tasks.append(
            ScheduledTask(
                task_id=task_id,
                start_minute=start_value,
                end_minute=end_value,
                selected=selected_value,
            )
        )

    return OptimizationResponse(
        status=result_status,
        selected_task_ids=selected_task_ids,
        scheduled_tasks=scheduled_tasks,
        total_priority_value=total_priority_value,
        block_duration_minutes=block_duration,
        objective_value=solver.ObjectiveValue(),
    )