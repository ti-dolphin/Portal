import { ReactElement } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  Box,
  Link,
  Typography,
  BreadcrumbsProps,
  Breadcrumbs as MUIBreadcrumbs,
} from '@mui/material';

// ----------------------------------------------------------------------

type TLink = {
  href?: string;
  name: string;
  icon?: ReactElement;
  isGoBack?: boolean;
};

export interface Props extends BreadcrumbsProps {
  links: TLink[];
  activeLast?: boolean;
}

export default function Breadcrumbs({ links, activeLast = false, ...other }: Props) {
  const currentLink = links[links.length - 1].name;

  const listDefault = links.map((link) => <LinkItem key={link.name} link={link} />);

  const listActiveLast = links.map((link) => (
    <div key={link.name}>
      {link.name !== currentLink ? (
        <LinkItem link={link} />
      ) : (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 260,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            color: 'text.disabled',
            textOverflow: 'ellipsis',
          }}
        >
          {currentLink}
        </Typography>
      )}
    </div>
  ));

  return (
    <MUIBreadcrumbs
      separator={
        <Box
          component="span"
          sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }}
        />
      }
      {...other}
    >
      {activeLast ? listDefault : listActiveLast}
    </MUIBreadcrumbs>
  );
}

// ----------------------------------------------------------------------

type LinkItemProps = {
  link: TLink;
};

function LinkItem({ link }: LinkItemProps) {
  const navigate = useNavigate();
  const { href, name, icon, isGoBack } = link;
  return (
    isGoBack ?
    <Link
      key={name}
      variant="body2"
      onClick={() => navigate(-1)}
      sx={{
        lineHeight: 2,
        display: 'flex',
        alignItems: 'center',
        color: 'text.primary',
        '& > div': { display: 'inherit' },
      }}
    >
      {icon && <Box sx={{ mr: 1, '& svg': { width: 20, height: 20 } }}>{icon}</Box>}
      {name}
    </Link> 
    :
    <Link
      key={name}
      variant="body2"
      component={RouterLink}
      to={href || '#'}
      sx={{
        lineHeight: 2,
        display: 'flex',
        alignItems: 'center',
        color: 'text.primary',
        '& > div': { display: 'inherit' },
      }}
    >
      {icon && <Box sx={{ mr: 1, '& svg': { width: 20, height: 20 } }}>{icon}</Box>}
      {name}
    </Link>
  );
}
