import * as React from 'react';
import MenuIcon from '@mui/icons-material/Menu'; // MUI burger icon
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useNavigate,useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseconfig';
import { toast } from 'react-toastify';
import iconAgriBuddy from './../src/assets/AgriBuddyAppIcon.png';


import { Wheat, Newspaper, Sprout, Bug, Worm,Flag } from 'lucide-react';



export default function Adminlayout(){



    const location=useLocation()
    const currentPath = location.pathname.replace(/^\/admin\/?/, '');

    const navigate = useNavigate();

    const pages = [
      { label: 'Article Management', path: 'article_management', icon:<Newspaper/> },
      { label: 'Reported Content', path: 'reported_content', icon:<Flag/> },
      { label: 'Crop Database', path: 'crop_database', icon:<Sprout/> },
      { label: 'Pest Database', path: 'pest_database', icon:<Bug/> },
      { label: 'Disease Database', path: 'disease_database', icon:<Worm/> },
    ];



    const theme=useTheme();
    const isMobile =useMediaQuery(theme.breakpoints.down('sm'))
    const [mobileOpen,setMobileOpen] = React.useState(false)
    



    const handleDrawerToggle = () => {
      setMobileOpen(!mobileOpen)
    }

  const drawerWidth = 200;
    const drawerContent = (
      <>
      {/* Logo Section */}
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', alignItems: 'center', p: 2 }}>
        <div style={{ 
            padding: 0,
            width:50,
            height:50, 
            backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={iconAgriBuddy} alt=""
            style={{
              width:'100%',height:'100%',borderRadius:'20%'
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <p style={{ fontWeight: '700', fontSize: '1rem', color: '#37474F' }}>AgriBuddy</p>
          <span style={{ fontWeight: '400', fontSize: '0.75rem', color: '#64748B' }}>Admin Panel</span>
        </div>
      </Box>


      {/* Navigation Items */}
      <List>
        {pages.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false); // close drawer on mobile after nav
                }}
                sx={{
                  backgroundColor: isActive ? '#607D8B' : 'transparent',
                  borderRadius: '10px',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {React.cloneElement(item.icon, {
                    size: 20,
                    color: isActive ? '#ffffff' : '#607D8B',
                  })}
                </ListItemIcon>
                <ListItemText primary={item.label} sx={{ color: isActive ? 'white' : '#607D8B' }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>


      <Divider />



      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            style={{ backgroundColor: 'red', color: 'white', borderRadius: 10 }}
            onClick={() => {
              signOut(auth).then(() => {
                navigate('/');
                toast.success("Logged out successfully");
              });
            }}
          >
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </Box>





      </>
    )





    return (
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', width: '100%' }}>
      {/* Burger Icon for Mobile */}
      {isMobile && (
        <Box sx={{ display: 'flex', p: 1, backgroundColor: '#607D8B' }}>
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better mobile performance
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 1,
          border: '0px solid green',
          flex: 1,
        }}
      >
        <Outlet />
      </Box>
    </Box>
      );
}