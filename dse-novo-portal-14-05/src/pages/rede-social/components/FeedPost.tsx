import { useState, useRef, useEffect } from "react";
import {
  Grid,
  Stack,
  Typography,
  Box,
  IconButton,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Card,
  CardHeader,
  CardActionArea,
  AvatarGroup,
  Divider,
  Chip,
} from "@mui/material";
import MAvatar from "src/components/MAvatar";
import Iconify from "src/components/Iconify";
import { GetSession } from "../../../session";
import createAvatar from "src/utils/createAvatar";
import FullScreenDialog from "src/components/FullScreenDialog";
import MenuPopover from "src/components/MenuPopover";
import { useNavigate } from "react-router-dom";
import { fShortenNumber } from "../../../utils/formatNumber";
import Markdown from "../../../components/Markdown";
import { fDate } from "../../../utils/formatTime";
import Label from "../../../components/Label";
import FeedPostArchive from "./FeedPostArchive";
import EstatisticasPost from "./EstatisticasPost";

type Props = {
  post: any;
  redeSocialHook: any;
};

export default function FeedPost({ redeSocialHook, post }: Props) {
  const usuario = GetSession("@dse-usuario");
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [like, setLike] = useState(false);
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  var archive = post.arquivos.filter(
    (arch: any) =>
      arch.titulo.toLowerCase().includes(".webp") ||
      arch.titulo.toLowerCase().includes(".jfif") ||
      arch.titulo.toLowerCase().includes(".png") ||
      arch.titulo.toLowerCase().includes(".jpg") ||
      arch.titulo.toLowerCase().includes(".jpeg") ||
      arch.titulo.toLowerCase().includes(".mp4") ||
      arch.titulo.toLowerCase().includes(".webm") ||
      arch.titulo.toLowerCase().includes(".ogg") ||
      arch.titulo.toLowerCase().includes(".mov")
  )[0];

  const handleChangeLike = (newValue: boolean | null) => {
    if (newValue) {
      redeSocialHook.handleLikePost(post.id);
      setLike(true);
    } else {
      redeSocialHook.handleRemoveLikePost(post.id);
      setLike(false);
    }
  };

  useEffect(() => {
    if (
      post.likes?.filter((like: any) => like.usuario_id === usuario.id).length >
      0
    ) {
      setLike(true);
    } else {
      setLike(false);
    }
  }, [post]);

  return (
    <>
      <Card
        onClick={() => navigate(`/rede-social/post/${post.id}`)}
        sx={{
          "&:hover": {
            cursor: "pointer",
            boxShadow: (theme) => theme.customShadows.z1,
          },
        }}
      >
        <CardHeader
          disableTypography
          avatar={
            <MAvatar
              color={createAvatar(post.usuario_nome).color}
              src={
                post.avatar
                  ? post.avatar
                  : post.usuario_tipo === "Administrador"
                  ? process.env.PUBLIC_URL + "/img/DOLPHIN.png"
                  : ""
              }
            >
              {createAvatar(post.usuario_nome).name}
            </MAvatar>
          }
          title={
            <Typography
              variant="subtitle1"
              onClick={(e: any) => {
                e.stopPropagation();
                redeSocialHook.onClickTag(post.usuario_nome);
              }}
            >
              {post.usuario_nome}
            </Typography>
          }
          action={
            (post.usuario_id === usuario.id ||
              usuario.tipo === "Administrador") && (
              <>
                <Box flexGrow={1} />
                <IconButton
                  ref={anchorRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(true);
                  }}
                >
                  <Iconify
                    icon={"bi:three-dots-vertical"}
                    width={18}
                    height={18}
                  />
                </IconButton>
              </>
            )
          }
          subheader={
            <Typography
              variant="caption"
              sx={{ display: "block", color: "text.secondary" }}
            >
              {fDate(post.data)}
            </Typography>
          }
        />
        <Stack spacing={1} sx={{ p: 3 }}>
          <Typography dangerouslySetInnerHTML={{ __html: post.conteudo }} />
          {/* <Markdown children={post.conteudo} linkable/> */}

          {post.url_video ? (
            <iframe
              src={post.url_video}
              frameborder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="video"
              height={"350px"}
            />
          ) : (
            archive && <FeedPostArchive archive={archive} />
          )}

          <Box flexGrow={1} height="100%" />

          <Divider />
          <Box>
            {post.tags.map((tag: any) => (
              <Label
                key={tag.valeu + "_" + tag.label}
                color={tag.tipo === "user" ? "secondary" : "info"}
                sx={{
                  m: 0.5,
                  fontWeight: "medium",
                  "&:hover": { cursor: "pointer" },
                }}
                onClick={(e: any) => {
                  e.stopPropagation();
                  redeSocialHook.onClickTag(tag.label);
                }}
              >
                {tag.label}
              </Label>
            ))}

            <Label
              color="primary"
              sx={{
                m: 0.5,
                fontWeight: "medium",
                "&:hover": { cursor: "pointer" },
              }}
              onClick={(e: any) => {
                e.stopPropagation();
                redeSocialHook.onClickTag(
                  post.comunidade[0]?.label
                    ? post.comunidade[0]?.label
                    : "Geral"
                );
              }}
            >
              {post.comunidade[0]?.label ? post.comunidade[0]?.label : "Geral"}
            </Label>
          </Box>

          <Stack direction="row" alignItems="center" sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={like}
                  size="small"
                  color="error"
                  onChange={(e) => handleChangeLike(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  icon={<Iconify icon="eva:heart-fill" />}
                  checkedIcon={<Iconify icon="eva:heart-fill" />}
                />
              }
              label={fShortenNumber(
                post.likes?.filter(
                  (like: any) => like.usuario_id === usuario.id
                ).length > 0 && !like
                  ? post.likes?.length - 1
                  : post.likes?.filter(
                      (like: any) => like.usuario_id === usuario.id
                    ).length === 0 && like
                  ? post.likes?.length + 1
                  : post.likes?.length
              )}
            />
            <AvatarGroup
              max={4}
              sx={{
                "& .MuiAvatar-root": { width: 32, height: 32 },
              }}
            >
              {post.likes.map((like: any) => (
                <MAvatar
                  src={
                    like.avatar
                      ? like.avatar
                      : like.usuario_tipo === "Administrador"
                      ? process.env.PUBLIC_URL + "/img/DOLPHIN.png"
                      : ""
                  }
                  key={like.id}
                  alt={like.usuario_nome}
                  color={createAvatar(like.usuario_nome).color}
                >
                  {createAvatar(like.usuario_nome).name}
                </MAvatar>
              ))}
            </AvatarGroup>
            <Box flexGrow={1} />
            <Stack direction="row" spacing={2}>
              {((post.arquivos.length === 1 && !archive) ||
                post.arquivos.length > 1) && (
                <Stack direction="row" spacing={0.5}>
                  <Iconify
                    icon="ic:round-attach-file"
                    height="24px"
                    width="24px"
                    sx={{ transform: "scaleX(-1)", color: "#637381" }}
                  />
                  <Typography variant="body1">
                    {(archive ? `+ ` : "") +
                      fShortenNumber(
                        archive
                          ? post.arquivos.length - 1
                          : post.arquivos.length
                      )}
                  </Typography>
                </Stack>
              )}
              {post.comentarios.length > 0 && (
                <Stack direction="row" spacing={1}>
                  <Iconify
                    icon="uim:comment-alt-dots"
                    height="24px"
                    width="24px"
                    sx={{ transform: "scaleX(-1)", color: "#637381" }}
                  />
                  <Typography variant="body1">
                    {fShortenNumber(post.comentarios.length)}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Stack>
        <MenuPopover
          onClick={(e) => e.stopPropagation()}
          open={open}
          onClose={() => setOpen(false)}
          anchorEl={anchorRef.current}
        >
          {usuario.tipo === "Administrador" && (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                setOpenModal(true);
              }}
            >
              <Stack spacing={1} direction="row" alignItems="center">
                <Iconify
                  icon={"mdi:graph-box-outline"}
                  width={20}
                  height={20}
                />
                <Typography>Estatísticas</Typography>
              </Stack>
            </MenuItem>
          )}
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              redeSocialHook.handleDeletePost(post.id);
            }}
          >
            <Stack spacing={1} direction="row" alignItems="center">
              <Iconify icon={"bx:trash"} width={20} height={20} />
              <Typography>Excluir Post</Typography>
            </Stack>
          </MenuItem>
        </MenuPopover>
      </Card>
      <FullScreenDialog
        open={openModal}
        handleClose={() => {
          setOpenModal(false);
          setOpen(false);
        }}
      >
        <EstatisticasPost post={post} />
      </FullScreenDialog>
    </>
  );
}
