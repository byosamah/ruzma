-- Update existing invoices to use the correct project names
UPDATE invoices 
SET project_name = projects.name
FROM projects 
WHERE invoices.project_id = projects.id 
AND invoices.project_name != projects.name;