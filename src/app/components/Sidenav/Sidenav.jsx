import styles from './Sidenav.module.scss';
import { List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { AvTimer, DriveFolderUpload, Home, LibraryBooks } from '@mui/icons-material';
import { For } from '../For';
import { Link } from 'react-router-dom';

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
  return (
    <div className={styles.sidenav}>
      <div className={styles.title}>
        <DriveFolderUpload className={styles.iconTitle} color={'secondary'}></DriveFolderUpload>
        <Typography variant="h5">FUS App</Typography>
      </div>
      <div>
        <List>
          <For each={items} trackBy="text">
            {item => (
              <ListItemButton component={Link} to={item.path}>
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
