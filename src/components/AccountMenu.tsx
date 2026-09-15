import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React, {useState} from "react";
import type {SpotifyUser} from "../types/SpotifyUser";

interface AccountMenuProps {
  userProfile: SpotifyUser | null;
  onRefresh: () => Promise<void>;
  onLogout: () => void;
}

function initials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AccountMenu: React.FC<AccountMenuProps> = ({userProfile, onRefresh, onLogout}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [refreshing, setRefreshing] = useState(false);
  const displayName = userProfile?.display_name || "Spotify user";
  const profileImage = userProfile?.images?.[0]?.url;

  const refresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <IconButton
        aria-label={`${displayName} account menu`}
        aria-controls={anchorEl ? "account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={anchorEl ? "true" : undefined}
        onClick={event => setAnchorEl(event.currentTarget)}
        sx={{color: "white"}}
      >
        <Avatar src={profileImage} alt="">
          {profileImage ? null : initials(displayName)}
        </Avatar>
      </IconButton>
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem disabled>
          <AccountCircleIcon sx={{mr: 1}} />
          <Typography>{displayName}</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={refresh} disabled={refreshing}>
          <ListItemIcon><RefreshIcon fontSize="small" /></ListItemIcon>
          {refreshing ? "Refreshing..." : "Refresh playback"}
        </MenuItem>
        <MenuItem onClick={onLogout}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          Log out
        </MenuItem>
      </Menu>
    </>
  );
};

export default AccountMenu;
