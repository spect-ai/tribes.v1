import { Menu } from '@mui/icons-material';
import {
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  SwipeableDrawer,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { useTribe } from '../../../../pages/tribe/[id]';
import { useSpace } from '../../../../pages/tribe/[id]/space/[bid]';

type Props = {
  items: {
    label: string;
    id: number;
  }[];
  type: 'tribe' | 'space' | 'explore';
};

function HamburgerMenu({ items, type }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { handleTabChange: spaceTabChange } = useSpace();
  const { handleTabChange: tribeTabChange } = useTribe();
  const { palette } = useTheme();
  return (
    <>
      <IconButton
        edge="start"
        color="secondary"
        aria-label="open drawer"
        onClick={() => setIsOpen(!isOpen)}
        sx={{ mr: 1, display: { xs: 'block', sm: 'none' } }}
      >
        <Menu />
      </IconButton>

      <SwipeableDrawer
        anchor="right"
        variant="temporary"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onOpen={() => setIsOpen(true)}
      >
        <List
          sx={{
            maxWidth: '10rem',
            backgroundColor: palette.background.default,
            height: '100%',
          }}
        >
          {items.map((item) => (
            <ListItemButton
              key={item.id}
              onClick={(e) => {
                if (type === 'tribe') {
                  tribeTabChange(e, item.id);
                }
                if (type === 'space') {
                  spaceTabChange(e, item.id);
                }
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </SwipeableDrawer>
    </>
  );
}

export default HamburgerMenu;
