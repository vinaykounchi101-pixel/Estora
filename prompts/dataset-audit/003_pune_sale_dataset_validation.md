# Prompt 003: Independent Validation of Real Estate Cleaned Dataset

- **Category**: `dataset-audit`
- **Timestamp**: `2026-10-22T15:40:30+05:30`
- **Branch**: `feat/dataset-audit`
- **Status**: Completed

---

## Verbatim Prompt Text

Continue work on Estora in the existing repository and branch. Read AGENTS.md, the current dataset audit report, and the new ZIP dataset's audit documentation first.

TASK: Independently validate the dataset real_estate_dataset_cleaned (1).zip before approving it for Estora sale-price model training.

1. PROVENANCE AND AUTHENTICITY
- Find and document the original publisher, source URL, collection date, license, and usage restrictions, if available.
- Do not describe listings as verified authentic or current unless the evidence supports that claim.
- Distinguish real-world listing data from verified completed transactions.
- If provenance or licensing cannot be verified, explicitly mark it unresolved.

2. REPRODUCIBILITY AND CLEANING
- Inspect CLEANING_REPORT.txt and the available cleaning code or notebook, if present.
- Verify the reported 401 duplicate removals against the original and cleaned training files.
- Check coordinate swapping, invalid-coordinate handling, and address/locality parsing.
- Confirm that original files remain unchanged.
- Check for suspicious prices, area values, duplicate properties, missingness, and inconsistent units.

3. PUNE SUBSET VALIDATION
- Independently reproduce the reported Pune counts for labeled training and unlabeled test records.
- Inspect locality and coordinate consistency, including potential boundary issues between Pune and PCMC.
- Do not infer Pune membership solely from coordinates or locality names without documenting the method.
- Report ambiguous and unclassified records separately.

4. TRAIN/TEST VALIDITY
- Verify that train and test schemas differ only for expected reasons, such as the missing target in test data.
- Check for exact or near-duplicate properties across splits and potential leakage.
- Determine how the original split was created, if documented.
- Explain whether the test set is appropriate for evaluating generalization to unseen listings.
- Do not use the unlabeled test set for training or fit preprocessing on it.

5. ESTORA DECISION
Create docs/data/pune_sale_dataset_validation.md with methods, reproducible counts, findings, limitations, provenance, license status, and a final recommendation: APPROVED for training, CONDITIONALLY APPROVED, or REJECTED. Justify the decision using evidence.

Do not train a model, change raw data, download additional data, commit, or push. Save this exact prompt using the established prompt-archiving workflow. Report files changed and any checks that could not be completed.
