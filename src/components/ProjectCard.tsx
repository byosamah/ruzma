
import React, { memo } from 'react';
import { ProjectCardProps } from './ProjectCard/types';
import VerticalProjectCard from './ProjectCard/VerticalProjectCard';
import StandardProjectCard from './ProjectCard/StandardProjectCard';

const ProjectCard: React.FC<ProjectCardProps> = (props) => {
  if (props.isVerticalLayout) {
    return <VerticalProjectCard {...props} />;
  }

  return <StandardProjectCard {...props} />;
};

export default memo(ProjectCard);
