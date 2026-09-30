"""MITRE ATT&CK service — Phase 6 placeholder.

This module will handle:
- MITRE technique lookup and metadata
- Mapping rule IDs to MITRE techniques
- Technique statistics and reporting

Not implemented in Phase 1. All methods are stubs with docstrings.
"""

from utils.logger import get_logger

logger = get_logger("mitre_service")


class MitreService:
    """Provides MITRE ATT&CK technique metadata and mappings.

    Phase 6 will implement:
    - Full MITRE ATT&CK technique database lookup
    - Rule ID → technique mapping table
    - Technique statistics aggregation
    - Tactic grouping and visualization data
    """

    def get_technique(self, technique_id: str) -> dict | None:
        """Look up a MITRE technique by ID."""
        raise NotImplementedError("MITRE lookup is Phase 6")

    def map_rule_to_technique(self, rule_id: str) -> dict | None:
        """Map an Axelle rule ID to a MITRE technique."""
        raise NotImplementedError("MITRE mapping is Phase 6")
