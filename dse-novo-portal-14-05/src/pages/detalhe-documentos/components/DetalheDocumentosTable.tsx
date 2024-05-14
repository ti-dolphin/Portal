import { useTheme } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import moment from "moment";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router";
import { visuallyHidden } from "@mui/utils";
import {
  Stack,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableSortLabel,
  IconButton,
  Box,
} from "@mui/material";

export default function TableRelatorio({
  relatorios,
  id,
  isFavorite,
  detalheDocumentosHook,
  header,
}: any) {
  const theme = useTheme();

  const navigate = useNavigate();

  const callbackCard = (projeto_id: number) => {
    navigate(`/newdetalheprojeto/${projeto_id}`);
  };

  return (
    <TableContainer sx={{ minWidth: "100%", mt: 3 }}>
      <Table sx={{ width: "100%" }}>
        <TableHead>
          <TableRow>
            {header.map((headCell: any) => (
              <TableCell
                key={headCell.id}
                align={headCell.numeric ? "right" : "left"}
                padding={headCell.disablePadding ? "none" : "normal"}
                sortDirection={
                  detalheDocumentosHook.orderBy === headCell.id
                    ? detalheDocumentosHook.order === "desc"
                      ? "desc"
                      : "asc"
                    : undefined
                }
              >
                <TableSortLabel
                  active={detalheDocumentosHook.orderBy === headCell.id}
                  direction={
                    detalheDocumentosHook.orderBy === headCell.id
                      ? (detalheDocumentosHook.order as "asc" | "desc")
                      : undefined
                  }
                  onClick={detalheDocumentosHook.createSortHandler(headCell.id)}
                >
                  {headCell.label}
                  {detalheDocumentosHook.orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {detalheDocumentosHook.order === "desc"
                        ? "sorted descending"
                        : "sorted ascending"}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {detalheDocumentosHook
            .stableSort(relatorios, detalheDocumentosHook.getComparator())
            .map((relatorio: any) => (
              <TableRow
                onClick={() => {
                  callbackCard(relatorio.projeto_id);
                }}
                key={relatorio.name}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                    cursor: "pointer",
                  },
                  transition: "background-color 0.3s",
                }}
              >
                <TableCell size="medium" component="th" scope="row">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton
                      onClick={(e: any) => {
                        e.stopPropagation();
                        detalheDocumentosHook.toggleFavoriteDetails(relatorio.id);
                      }}
                    >
                      {relatorio.isFavorite === 0 ? (
                        <StarOutlineIcon color="warning" />
                      ) : (
                        <StarIcon color="warning" />
                      )}
                    </IconButton>
                    {relatorio.documento}
                  </Stack>
                </TableCell>
                <TableCell component="th" align="left">
                  {relatorio.projeto}
                </TableCell>
                <TableCell component="th" align="left">
                  {relatorio.pasta}
                </TableCell>
                <TableCell align="left" component="th">
                  <Chip
                    size="small"
                    sx={{
                      color:
                        detalheDocumentosHook.colorAdvice(
                          detalheDocumentosHook.formatDays(
                            relatorio.data_vencimento
                          )
                        ) === theme.palette.error.main
                          ? "white"
                          : "black",
                      background: detalheDocumentosHook.colorAdvice(
                        detalheDocumentosHook.formatDays(
                          relatorio.data_vencimento
                        )
                      ),
                    }}
                    label={detalheDocumentosHook.formatDaysToDueDate(
                      relatorio.data_vencimento
                    )}
                  />
                </TableCell>
                <TableCell component="th" align="left">
                  {moment(relatorio.data_vencimento).format("DD/MM/YYYY")}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
