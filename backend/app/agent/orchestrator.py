from .agent_state import AgentState
from .field_mapper import map_field
from .recovery import recover_and_update_workflow
from .requirement_parser import parse_requirement
from .schemas import AgentResult
from .workflow_memory import get_workflow, save_workflow
from .browser_adapter_impl import BrowserAdapterImpl


class AgentOrchestrator:

    def __init__(self, browser=None):

        self.browser = browser or BrowserAdapterImpl()

        self.state = AgentState.IDLE

    def set_state(self, state: AgentState):

        self.state = state

        print(f"\n🤖 Agent State → {state.value}")

    def run(
        self,
        user_request: str,
        supplier_id: str,
    ) -> AgentResult:

        # --------------------------------------------------
        # STEP 1 — Understand user
        # --------------------------------------------------

        self.set_state(AgentState.UNDERSTANDING)

        requirements = parse_requirement(user_request)

        # --------------------------------------------------
        # STEP 2 — Check memory
        # --------------------------------------------------

        self.set_state(AgentState.CHECKING_MEMORY)

        workflow = get_workflow(supplier_id)

        # --------------------------------------------------
        # STEP 3 — Inspect current website
        # --------------------------------------------------

        current_fields = self.browser.inspect_fields()

        # --------------------------------------------------
        # STEP 4 — Learn if no workflow exists
        # --------------------------------------------------

        if workflow is None:

            self.set_state(AgentState.LEARNING)

            mappings = {}

            for field in current_fields:

                result = map_field(field)

                if result.concept and result.confidence >= 0.85:

                    mappings[result.concept] = field

            if not mappings:

                self.set_state(AgentState.FAILED)

                return AgentResult(
                    success=False,
                    state=self.state.value,
                    supplier_id=supplier_id,
                    message="Could not understand supplier form.",
                    requirements=requirements,
                )

            save_workflow(
                supplier_id=supplier_id,
                mappings=mappings,
            )

            workflow = get_workflow(supplier_id)

        # --------------------------------------------------
        # STEP 5 — Reuse existing workflow
        # --------------------------------------------------

        else:

            self.set_state(AgentState.REUSING)

        mappings = workflow["mappings"]

        # --------------------------------------------------
        # STEP 6 — Fill fields
        # --------------------------------------------------

        requirement_values = {
            "product": requirements.product,
            "quantity": str(requirements.quantity),
            "delivery_location": requirements.delivery_location,
            "delivery": (
                str(requirements.max_delivery_days)
                if requirements.max_delivery_days is not None
                else None
            ),
            "warranty": (
                str(requirements.min_warranty_years)
                if requirements.min_warranty_years is not None
                else None
            ),
        }

        for concept, value in requirement_values.items():

            if value is None:
                continue

            field_name = mappings.get(concept)

            if not field_name:
                continue

            success = self.browser.fill_field(
                field_name,
                value,
            )

            # --------------------------------------------------
            # STEP 7 — Recovery if field fails
            # --------------------------------------------------

            if not success:

                self.set_state(AgentState.RECOVERING)

                recovery = recover_and_update_workflow(
                    supplier_id=supplier_id,
                    concept=concept,
                    old_field=field_name,
                    current_fields=current_fields,
                )

                if not recovery.success:

                    self.set_state(AgentState.FAILED)

                    return AgentResult(
                        success=False,
                        state=self.state.value,
                        supplier_id=supplier_id,
                        message=(
                            f"Could not recover field for '{concept}'."
                        ),
                        requirements=requirements,
                        mappings=mappings,
                    )

                field_name = recovery.new_field

                mappings[concept] = field_name

                success = self.browser.fill_field(
                    field_name,
                    value,
                )

                if not success:

                    self.set_state(AgentState.FAILED)

                    return AgentResult(
                        success=False,
                        state=self.state.value,
                        supplier_id=supplier_id,
                        message=(
                            f"Recovered field '{field_name}' "
                            "but browser could not fill it."
                        ),
                        requirements=requirements,
                        mappings=mappings,
                    )

        # --------------------------------------------------
        # STEP 8 — Complete
        # --------------------------------------------------

        self.set_state(AgentState.COMPLETED)

        return AgentResult(
            success=True,
            state=self.state.value,
            supplier_id=supplier_id,
            message="Supplier quote workflow completed successfully.",
            requirements=requirements,
            mappings=mappings,
        )