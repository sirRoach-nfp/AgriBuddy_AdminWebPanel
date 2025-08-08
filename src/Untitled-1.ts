const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // md = 960px, you can adjust to 'sm' if you want <768px
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerWidth = 200;

  const drawerContent = (
    <>
      {/* Logo Section */}
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', alignItems: 'center', p: 2 }}>
        <div style={{ padding: '.75rem', backgroundColor: '#607D8B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wheat color='white' />
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
  );

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
          p: 2,
          border: '0px solid green',
          flex: 1,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
