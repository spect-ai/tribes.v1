import {
  Avatar,
  Box,
  Popover,
  List,
  Typography,
  IconButton,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useSpace } from "../../../../../pages/tribe/[id]/space/[bid]";
import { useMoralisFunction } from "../../../../hooks/useMoralisFunction";
import { Block, Task } from "../../../../types";
import { uid, formatTimeCreated } from "../../../../utils/utils";
import Editor from "../../editor";
import { PrimaryButton } from "../../../elements/styledComponents";
import { notify } from "../../settingsTab";
import { useProfileInfo } from "../../../../hooks/useProfileInfo";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useCardDynamism } from "../../../../hooks/useCardDynamism";

type Props = {
  task: Task;
  setTask: (task: Task) => void;
};

function isInitComment(blocks: Block[]) {
  return (
    blocks.length === 1 &&
    blocks[0].html === "" &&
    blocks[0].tag === "p" &&
    blocks[0].type === "" &&
    blocks[0].imageUrl === "" &&
    blocks[0].embedUrl === ""
  );
}

const Comments = ({ task, setTask }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { space, setSpace } = useSpace();
  const { runMoralisFunction } = useMoralisFunction();
  const { user } = useMoralis();
  const { avatar } = useProfileInfo();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [openPopoverId, setOpenPopoverId] = useState("");
  const [mode, setMode] = useState("add");
  const [editId, setEditId] = useState("");
  const { viewableComponents } = useCardDynamism(task);

  const handleClose = () => {
    setOpen(false);
  };
  const [commentOnEdit, setCommentOnEdit] = useState([
    {
      id: uid(),
      html: "",
      tag: "p",
      type: "",
      imageUrl: "",
      embedUrl: "",
    },
  ]);

  const handleClick =
    (id: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
      setOpenPopoverId(id);
      setOpen(true);
    };

  const syncBlocksToMoralis = (blocks: Block[]) => {
    setIsLoading(true);
    const temp = Object.assign({}, task);
    setTask(temp);
    runMoralisFunction("updateCard", {
      updates: {
        comments: {
          mode: mode,
          content: blocks,
          id: editId,
        },
        taskId: task.taskId,
      },
    })
      .then((res) => {
        notify(mode === "add" ? "Comment added" : "Comment edited", "success");
        setSpace(res.space);
        setTask(res.task);
        setEditId("");
        setMode("add");
        setCommentOnEdit([
          {
            id: uid(),
            html: "",
            tag: "p",
            type: "",
            imageUrl: "",
            embedUrl: "",
          },
        ]);
        setIsLoading(false);
      })
      .catch((err) => {
        notify(err.message, "error");
        setIsLoading(false);
      });
  };

  const handleEdit = (id: string) => {
    const comment = task.comments.find((c) => c.id === id);
    setMode("edit");
    setEditId(id);
    setCommentOnEdit(comment?.content || []);
    handleClose();
  };

  const handleDelete = (id: string) => {
    setIsLoading(true);
    runMoralisFunction("updateCard", {
      updates: {
        comments: {
          mode: "delete",
          id: id,
        },
        taskId: task.taskId,
      },
    })
      .then((res) => {
        console.log(res);
        setSpace(res.space);
        setTask(res.task);
        setEditId("");
        setMode("add");
        setCommentOnEdit([
          {
            id: uid(),
            html: "",
            tag: "p",
            type: "",
            imageUrl: "",
            embedUrl: "",
          },
        ]);
        notify("Comment deleted", "success");
        handleClose();
        setIsLoading(false);
      })
      .catch((err) => {
        notify(err.message, "error");
        handleClose();
        setIsLoading(false);
      });
  };

  const handleCancel = () => {
    setMode("add");
    setEditId("");
  };

  const doNothing = () => {};

  return (
    <Box
      sx={{
        color: "#eaeaea",
        height: "auto",
        mr: 3,
        mt: 3,
        ml: 3,
        width: "45rem",
      }}
    >
      {task.comments?.map((comment, index) => (
        <Box sx={{ borderBottom: 1 }} key={index}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              mt: 4,
            }}
          >
            <Avatar
              variant="rounded"
              sx={{ p: 0, m: 0, width: 32, height: 32 }}
              src={space.memberDetails[comment.userId]?.profilePicture?._url}
            />
            <Typography
              variant="body1"
              sx={{
                ml: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              {space.memberDetails[comment.userId]?.username}
            </Typography>{" "}
            <Typography
              variant="body2"
              sx={{
                ml: 4,
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              {formatTimeCreated(comment?.createdAt)} ago
            </Typography>{" "}
            {comment?.edited && (
              <Typography
                variant="body2"
                sx={{
                  ml: 4,
                  display: "flex",
                  alignItems: "center",
                  color: "text.secondary",
                }}
              >
                Edited {formatTimeCreated(comment?.updatedAt)} ago
              </Typography>
            )}
            <Box sx={{ flex: "1 1 auto" }} />
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              {user?.id === comment.userId && (
                <IconButton
                  sx={{ m: 0, px: 2 }}
                  onClick={handleClick(comment.id)}
                >
                  <MoreHorizIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          {mode === "edit" && editId === comment.id ? (
            <>
              <Editor
                syncBlocksToMoralis={setCommentOnEdit}
                initialBlock={comment.content}
                placeholderText={``}
                readonly={false}
              />
              <PrimaryButton
                variant="outlined"
                sx={{
                  mb: 2,
                  borderRadius: 1,
                  width: "4rem",
                  height: "2rem",
                }}
                color="secondary"
                size="small"
                loading={isLoading}
                onClick={() => {
                  syncBlocksToMoralis(commentOnEdit);
                }}
              >
                Save
              </PrimaryButton>
              <PrimaryButton
                variant="outlined"
                sx={{
                  ml: 1,
                  mb: 2,
                  borderRadius: 1,
                  width: "4rem",
                  height: "2rem",
                }}
                color="secondary"
                size="small"
                loading={isLoading}
                onClick={() => {
                  handleCancel();
                }}
              >
                Cancel
              </PrimaryButton>
            </>
          ) : (
            <Editor
              syncBlocksToMoralis={setCommentOnEdit}
              initialBlock={comment.content}
              placeholderText={``}
              readonly={true}
            />
          )}
        </Box>
      ))}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => handleClose()}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <List
          sx={{
            width: "100%",
            maxWidth: 360,
            maxHeight: 200,
            overflow: "auto",
            bgcolor: "background.paper",
          }}
          component="nav"
          aria-labelledby="nested-list-subheader"
        >
          <ListItemButton onClick={() => handleEdit(openPopoverId)}>
            <ListItemText primary="Edit" />
          </ListItemButton>
          <ListItemButton
            onClick={() => {
              handleDelete(openPopoverId);
            }}
          >
            <ListItemText primary="Delete" />
          </ListItemButton>
        </List>
      </Popover>
      {mode !== "edit" && !isLoading && viewableComponents["addComment"] && (
        <>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              mt: 4,
            }}
          >
            <Avatar
              variant="rounded"
              sx={{ p: 0, m: 0, width: 32, height: 32 }}
              src={avatar}
            />
            <Typography
              variant="body1"
              sx={{ display: "flex", alignItems: "center", ml: 2 }}
            >
              {user?.get("username")}
            </Typography>{" "}
          </Box>
          <Editor
            syncBlocksToMoralis={setCommentOnEdit}
            initialBlock={commentOnEdit}
            placeholderText={`Add a comment, press "/" for commands`}
          />
          <PrimaryButton
            variant="outlined"
            sx={{
              mt: 2,
              borderRadius: 1,
              width: "8rem",
              height: "2rem",
            }}
            color="secondary"
            size="small"
            loading={isLoading}
            onClick={() => {
              syncBlocksToMoralis(commentOnEdit);
            }}
            disabled={isInitComment(commentOnEdit)}
          >
            Add comment
          </PrimaryButton>
        </>
      )}
      {mode !== "edit" && !isLoading && !viewableComponents["addComment"] && (
        <Typography
          variant="body1"
          sx={{ display: "flex", alignItems: "center", ml: 2 }}
        >
          No comments have been added yet.
        </Typography>
      )}
    </Box>
  );
};

export default Comments;
