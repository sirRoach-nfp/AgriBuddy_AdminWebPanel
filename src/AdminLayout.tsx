import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseconfig';
import { toast } from 'react-toastify';



export default function Adminlayout(){

    const navigate = useNavigate();

    const pages = [
      { label: 'Article Management', path: 'article_management' },
      { label: 'Reported Content', path: 'reported_content' },
      { label: 'Crop Database', path: 'crop_database' },
      { label: 'Pest Database', path: 'pest_database' },
      { label: 'Disease Database', path: 'disease_database' },
    ];

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            {/* Drawer */}
            <Drawer
              variant="permanent"
              sx={{
                width: 200,
                border: '0px solid black',
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: 200,
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between', // This pushes the bottom content to the bottom
                },
              }}
            >
              {/* Top List */}
              <Box>
                <List>
                  {pages.map((item) => (
                    <ListItem key={item.label} disablePadding>
                      <ListItemButton onClick={() => navigate(item.path)}>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Divider />
              </Box>

              {/* Logout Section */}
              <Box sx={{ p: 2 }}>
                <ListItem disablePadding>
                  <ListItemButton

                  style={{backgroundColor:"red",color:"white",borderRadius:10}} 
                    onClick={() => {
                      signOut(auth).then(() => {
                        navigate('/'); // back to login screen
                        toast.success("Logged out successfully");
                      });
                    }}
                  >
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </Box>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 2, border: '1px solid green', flex: 1 }}>
              <Outlet />
            </Box>
          </Box>
      );
}