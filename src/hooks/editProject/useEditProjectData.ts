
import { useState, useEffect } from 'react';
import { DatabaseProject } from '@/hooks/projectTypes';
import { MilestoneFormData } from '@/components/EditProject/types';
import { isUUID } from '@/lib/slugUtils';

export const useEditProjectData = (projects: DatabaseProject[], slugOrId: string | undefined) => {
  const [project, setProject] = useState<DatabaseProject | null>(null);
  const [name, setName] = useState('');
  const [brief, setBrief] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [paymentProofRequired, setPaymentProofRequired] = useState(false);
  const [milestones, setMilestones] = useState<MilestoneFormData[]>([]);

  useEffect(() => {
    if (projects.length > 0 && slugOrId) {
      let found: DatabaseProject | undefined;
      
      // Check if it's a UUID (backward compatibility) or slug
      if (isUUID(slugOrId)) {
        found = projects.find((p) => p.id === slugOrId);
      } else {
        found = projects.find((p) => p.slug === slugOrId);
      }

      if (found) {
        setProject(found);
        setName(found.name);
        setBrief(found.brief);
        setClientEmail(found.client_email || '');
        setPaymentProofRequired(found.payment_proof_required || false);
        
        const formattedMilestones = found.milestones.map((milestone) => ({
          title: milestone.title,
          description: milestone.description,
          price: milestone.price,
          status: milestone.status,
          start_date: milestone.start_date || '',
          end_date: milestone.end_date || '',
        }));
        
        setMilestones(formattedMilestones);
      }
    }
  }, [projects, slugOrId]);

  return {
    project,
    name,
    brief,
    clientEmail,
    paymentProofRequired,
    milestones,
    setName,
    setBrief,
    setClientEmail,
    setPaymentProofRequired,
    setMilestones,
  };
};
