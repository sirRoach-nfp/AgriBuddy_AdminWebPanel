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





export default function HomePages(){

    const [openDrawer,setOpenDrawer] = React.useState(false)

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpenDrawer(newOpen);
      };


    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>



          <List>

            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemText primary="Article Management"/>
                </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemText primary="Article Management"/>
                </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
                <ListItemButton>
                    <ListItemText primary="Article Management"/>
                </ListItemButton>
            </ListItem>


          </List>




        </Box>
      );


    return(
        <div className="mainWrapper">

        </div>
    )
}