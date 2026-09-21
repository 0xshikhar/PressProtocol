# Security Policy

## Reporting a Vulnerability

The PressProtocol team takes the security and integrity of sovereign publishing infrastructure seriously. We appreciate the efforts of security researchers and community members who help protect independent journalism and uncensored publishing rails.

If you discover a security vulnerability within PressProtocol, please report it responsibly following this policy.

---

### Supported Versions

We actively maintain and provide security updates for the following components:

| Component | Version / Branch | Supported |
|:---|:---|:---|
| PressProtocol Web Portal (`apps/web`) | Latest `master` | :white_check_mark: |
| Sovereign Node Daemon (`core/node`) | `>= 1.0.0` | :white_check_mark: |
| Headless TypeScript SDK (`@pressprotocol/sdk`) | `>= 1.0.0` | :white_check_mark: |
| Air-Gap Proof Codec (`@pressprotocol/proof`) | `>= 1.0.0` | :white_check_mark: |
| Universal Web Component (`@pressprotocol/widget`) | `>= 1.0.0` | :white_check_mark: |
| Chromium MV3 Sovereign Web Clipper | `>= 2.0.0` | :white_check_mark: |
| WordPress Plugin (`integrations/wordpress-plugin`) | `>= 1.0.0` | :white_check_mark: |
| Language SDKs (Python, Go, Rust) | Latest release | :white_check_mark: |

---

### Vulnerability Reporting Guidelines

**Please DO NOT report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, please report vulnerabilities using one of the following confidential channels:

1. **GitHub Private Vulnerability Reporting**:
   - Navigate to the [Security Advisories tab](https://github.com/0xshikhar/PressProtocol/security/advisories) on GitHub.
   - Click **"Report a vulnerability"** to submit an advisory draft directly to the maintainers.

2. **Direct Maintainer Contact**:
   - Email: `privacy@pressprotocol.com` or contact the lead maintainer directly via encrypted channel.
   - If sending sensitive exploit material, please encrypt using our public PGP key.

---

### What to Include in Your Report

To help us triage and investigate your report efficiently, please include:

- **Summary**: A clear, concise overview of the vulnerability and its potential impact.
- **Affected Components**: Specific packages, files, endpoints, or SDK versions affected.
- **Step-by-Step Reproduction**: Detailed steps or a minimal proof-of-concept (PoC) script demonstrating the issue.
- **Threat Model & Severity**: Assessment of attack vectors (e.g., clearnet eavesdropping, IPFS gateway poisoning, key isolation bypass, Tor hidden service deanonymization).
- **Suggested Remediation**: If known, any proposed fixes or mitigations.

---

### Response & Disclosure Timeline

- **Initial Acknowledgment**: Within **48 hours** of receiving your report.
- **Triage & Validation**: Within **5 business days**, confirming reproduction and assigning severity.
- **Resolution & Patch**: Target patch deployment within **14–30 days** depending on severity.
- **Coordinated Disclosure**: We adhere to coordinated vulnerability disclosure. We ask that reporters maintain confidentiality until an advisory and fix are released publicly.

---

### Out of Scope

The following areas are considered out of scope unless they demonstrate a direct, novel exploit against PressProtocol rails:

- Denial of Service (DoS/DDoS) attacks against third-party public IPFS gateways.
- Theoretical attacks requiring physical device access without cryptographic compromise.
- Social engineering or phishing targeting community members.
- Issues related to third-party dependencies with no demonstrated exploit path in PressProtocol.

Thank you for helping keep sovereign publishing secure!
