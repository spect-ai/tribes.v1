import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DateRangeIcon from "@mui/icons-material/DateRange";
import PersonIcon from "@mui/icons-material/Person";
import LabelIcon from "@mui/icons-material/Label";
import PaidIcon from "@mui/icons-material/Paid";
import UpdateIcon from "@mui/icons-material/Update";
import HailIcon from "@mui/icons-material/Hail";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import PublishIcon from "@mui/icons-material/Publish";
import CommentIcon from "@mui/icons-material/Comment";
import DoneIcon from "@mui/icons-material/Done";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useSpace } from "../../pages/tribe/[id]/space/[bid]";
import AddTaskIcon from "@mui/icons-material/AddTask";
export function useActivityMap() {
  const { space, setSpace } = useSpace();

  const activityIcons: any = {
    100: <AddTaskIcon />,
    101: <DateRangeIcon />,
    102: <LabelIcon />,
    104: <PaidIcon />,
    105: <PersonIcon />,
    106: <PersonIcon />,
    150: <HailIcon />,
    151: <HailIcon />,
    152: <CheckBoxIcon />,
    200: <VisibilityIcon />,
    201: <CommentIcon />,
    205: <DoneIcon />,
    300: <PaidIcon />,
    301: <ChatBubbleIcon />,
    400: <SyncAltIcon />,
  };

  const generateActivityLine = (update: any) => {
    switch (update.action) {
      case 100:
        return `${space.memberDetails[update.actor].username} created ${
          update.taskType
        }`;
      case 101:
        return `${
          space.memberDetails[update.actor].username
        } updated due date to ${update.deadline}`;
      case 102:
        return `${space.memberDetails[update.actor].username} updated tags to `;
      case 104:
        `${space.memberDetails[update.actor].username} updated reward to ${
          update.reward?.value
        } ${update.reward?.token?.symbol} on ${update.reward?.chain?.name}`;
      case 105:
        return `${space.memberDetails[update.actor].username} assigned ${
          update.taskType
        } `;
      case 106:
        return `${
          space.memberDetails[update.actor].username
        } updated reviewer `;
      case 150:
        return `${space.memberDetails[update.actor].username} applied to ${
          update.taskType
        }`;
      case 151:
        return `${
          space.memberDetails[update.actor].username
        } updated application to ${update.taskType}`;
      case 152:
        return `${space.memberDetails[update.actor].username} picked ${
          update.selectedApplicant
        }'s application to ${update.taskType}`;
      case 200:
        return `${
          space.memberDetails[update.actor].username
        } asked for a review`;
      case 201:
        return `${space.memberDetails[update.actor].username} added comments`;
      case 205:
        return `${space.memberDetails[update.actor].username} closed ${
          update.taskType
        }`;
      case 300:
        return `${space.memberDetails[update.actor].username} paid for the ${
          update.taskType
        }`;
      case 301:
        return `${space.memberDetails[update.actor].username} added feedback`;
      case 400:
        return `${space.memberDetails[update.actor].username} moved ${
          update.taskType
        } from ${update.columnChange.sourceId} to ${
          update.columnChange.destinationId
        }`;
    }
  };
  return {
    generateActivityLine,
    activityIcons,
  };
}
