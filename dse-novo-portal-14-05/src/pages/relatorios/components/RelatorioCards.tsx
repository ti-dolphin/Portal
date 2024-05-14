import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { CardActionArea, Stack, Rating } from "@mui/material";

export default function ActionAreaCard({
  id,
  name,
  isFavorite,
  onClick,
  relatorioHook
}: any) {

  const onClickRating = (e: any) => {
    e.stopPropagation();
    relatorioHook.toggleFavorite(id);
  };

  return (
    <Card onClick={() => onClick()}>
      <CardActionArea>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography gutterBottom variant="h5" m={0} component="div">
              {name}
            </Typography>
            {/* <Rating max={1} value={isFavorite} onClick={(e) => onClickRating(e)} /> */}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
