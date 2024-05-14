import * as React from 'react';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ToggleButton from '@mui/material/ToggleButton';
import { useState } from 'react';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function HorizontalToggleButtons() {
  const [view, setView] = useState('list');

  const handleChange = (event: React.MouseEvent<HTMLElement>, nextView: string) => {
    setView(nextView);
  };

  return (
    <ToggleButtonGroup
      orientation="horizontal"
      value={view}
      exclusive
      onChange={handleChange}
    >
      <ToggleButton value="module" aria-label="module">
        <ViewListIcon />
      </ToggleButton>
      <ToggleButton value="list" aria-label="list">
        <ViewModuleIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}