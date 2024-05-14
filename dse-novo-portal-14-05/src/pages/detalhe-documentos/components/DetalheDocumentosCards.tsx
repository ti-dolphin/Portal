import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { CardActionArea, Stack, Rating, IconButton } from "@mui/material";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import moment from "moment";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import StarIcon from "@mui/icons-material/Star";

export default function DetalheActionCard({
  id,
  data_vencimento,
  documento,
  projeto,
  pasta,
  isFavorite,
  detalheDocumentosHook,
  onClick,
}: any) {
  const theme = useTheme();
  const colorAdvice = (daysDifference: number) => {
    if (daysDifference <= 5) {
      return theme.palette.error.main;
    } else if (daysDifference >= 6 && daysDifference <= 14) {
      return theme.palette.warning.main;
    } else {
      return theme.palette.grey[500];
    }
  };

  const formatDaysToDueDate = (dueDate: string) => {
    const currentDate = moment();
    const dueDateMoment = moment(dueDate);
    const daysDifference = dueDateMoment.diff(currentDate, "days");

    if (daysDifference === 0) {
      return "Vence hoje";
    } else if (daysDifference === 1) {
      return "Vence amanhã";
    } else if (daysDifference > 1) {
      return `Faltam ${daysDifference} dias para vencer`;
    } else {
      return "Vencido";
    }
  };

  const handleRatingClick = (e: any) => {
    e.stopPropagation();
    detalheDocumentosHook.toggleFavoriteDetails(id);
  };

  const formatDays = (dueDate: string) => {
    const currentDate = moment();
    const dueDateMoment = moment(dueDate);
    const daysDifference = dueDateMoment.diff(currentDate, "days");

    return daysDifference;
  };

  return (
    <Card onClick={() => onClick()}>
      <CardActionArea>
        <CardContent>
          <Stack
            direction="column"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography gutterBottom variant="h6" m={0} component="div">
                <Stack direction="row" spacing={1}>
                  <Chip
                    size="small"
                    sx={{
                      color:
                        colorAdvice(formatDays(data_vencimento)) ===
                        theme.palette.error.main
                          ? "white"
                          : "black",
                      background: colorAdvice(formatDays(data_vencimento)),
                    }}
                    label={formatDaysToDueDate(data_vencimento)}
                  />
                </Stack>
              </Typography>
              <IconButton onClick={handleRatingClick}>
                {isFavorite === 0 ? (
                  <StarOutlineIcon color="warning" />
                ) : (
                  <StarIcon color="warning" />
                )}
              </IconButton>
            </Stack>

            <Typography gutterBottom variant="h6" m={0} component="div">
              {documento}
            </Typography>

            <Typography m={0} component="div" variant="body2">
              {projeto}
            </Typography>

            <Typography m={0} component="div" variant="body2">
              {pasta}
            </Typography>

            <Typography m={0} component="div" variant="subtitle2">
              {moment(data_vencimento).format("DD/MM/YYYY")}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
