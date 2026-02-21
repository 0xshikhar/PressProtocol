name: 🐛 Bug Report
description: Create a report to help us fix a bug in PressProtocol
title: "[BUG]: "
labels: ["bug"]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        Thank you for reporting a bug! Please provide as much detail as possible.

  - type: dropdown
    id: component
    attributes:
      label: Component Affected
      options:
        - "core/node (P2P Relay Daemon)"
        - "apps/web (Web Portal)"
        - "integrations/browser-extension"
        - "integrations/wordpress-plugin"
        - "Tor / IPFS Transport"
        - "Other / Documentation"
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: Describe the bug
      description: A clear and concise description of what the bug is.
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior.
      placeholder: |
        1. Go to '...'
        2. Click on '....'
        3. Scroll down to '....'
        4. See error
    validations:
      required: true

  - type: textarea
    id: logs
    attributes:
      label: Terminal Logs / Error Stack
      description: Paste any error messages or logs (ensure sensitive API keys are masked).
      render: shell
