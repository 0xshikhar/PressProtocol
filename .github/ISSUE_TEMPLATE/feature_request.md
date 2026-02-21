name: ✨ Feature Proposal
description: Suggest an idea or enhancement for PressProtocol
title: "[FEATURE]: "
labels: ["enhancement"]
assignees: []

body:
  - type: textarea
    id: problem
    attributes:
      label: Is your feature request related to a problem?
      description: A clear description of what the problem or limitation is.
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: Describe the solution you'd like to see added.
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: Describe any alternative solutions or features you've considered.
