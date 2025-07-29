UPDATE projects 
SET 
  contract_terms = 'This project is governed by standard freelance service terms. All work will be delivered according to the agreed milestones and specifications. The freelancer retains the right to showcase this work in their portfolio unless otherwise specified.',
  payment_terms = 'Payment is due upon completion and approval of each milestone. Payments should be made within 7 business days of milestone completion. Late payments may result in project delays.',
  project_scope = 'The project scope includes all deliverables and milestones as outlined in the project details. Any additional work outside the defined scope will require a separate agreement and may incur additional costs.',
  revision_policy = 'Up to 2 rounds of revisions are included for each milestone. Additional revisions beyond this limit may incur extra charges. Revisions must be requested within 7 days of milestone delivery.'
WHERE id = '3f4d4eca-6034-47f5-9e4f-f4b5aa27a9ed';