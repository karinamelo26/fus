import styles from './sidenav.module.scss';
import { List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { AvTimer, DriveFolderUpload, Home, LibraryBooks } from '@mui/icons-material';
import { For } from '../For';
import { useLocation } from 'react-router-dom';
import { BetterLink } from '../BetterLink';

export function Sidenav() {
  const items = [
    {
      icon: <Home></Home>,
      text: 'Home',
      path: '/',
    },
    {
      icon: <LibraryBooks></LibraryBooks>,
      text: 'Databases',
      path: '/databases',
    },
    {
      icon: <AvTimer></AvTimer>,
      text: 'Schedules',
      path: '/schedules',
    },
  ];

  const { pathname } = useLocation();

  return (
    <div className={styles.sidenav}>
      <div className={styles.title}>
        <DriveFolderUpload className={styles.iconTitle} color={'secondary'}></DriveFolderUpload>
        <Typography variant="h5">FUS App</Typography>
      </div>
      <div>
        <List>
          <For each={items} trackBy="text">
            {(item) => (
              <ListItemButton component={BetterLink} to={item.path} selected={pathname === item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text}></ListItemText>
              </ListItemButton>
            )}
          </For>
        </List>
      </div>
    </div>
  );
}
