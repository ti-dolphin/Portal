import { forwardRef } from 'react'
import PropTypes from 'prop-types';
import { m, motion } from 'framer-motion';
// material
import { Box } from '@mui/material';
//
import { varSmallClick, varMediumClick } from './variants/Actions.js'

// ----------------------------------------------------------------------

// ButtonAnimate.propTypes = {
//   mediumClick: PropTypes.bool,
//   children: PropTypes.node,
//   sx: PropTypes.object,
// };

// export default function ButtonAnimate({ mediumClick = false, children, sx, ...other }, ref) {
//   return (
//     <>
//       forwardRef(
//         <Box
//           ref={forwardRef}
//           component={m.div}
//           whileTap="tap"
//           whileHover="hover"
//           variants={mediumClick ? varMediumClick : varSmallClick}
//           sx={{ display: 'inline-flex', ...sx }}
//           {...other}
//         >
//           {children}
//         </Box>
//       )
//     </>
//   );
// }



const ButtonAnimate = forwardRef(
  ({ inative, mediumClick = false, children, sx, ...other }, ref) => (
    <Box
      ref={ref}
      component={m.div}
      whileTap= {!inative && "tap"}
      whileHover={!inative && "hover"}
      variants={mediumClick ? varMediumClick : varSmallClick}
      sx={{ display: 'inline-flex', ...sx }}
      {...other}
    >
      {children}
    </Box>
  )
);

export default ButtonAnimate;
