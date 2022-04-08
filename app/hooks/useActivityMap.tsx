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

export function useActivityMap() {
  const { space, setSpace } = useSpace();

  const activityIcons = {
    100: <AddCircleOutlineIcon />,
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
        return `${update.actor} created ${update.taskType}`;
      case 101:
        return `${update.actor} updated due date to ${update.deadline}`;
      case 102:
        return `${update.actor} updated tags to `;
      case 104:
        `${update.actor} updated reward to ${update.reward?.value} ${update.reward?.token?.symbol} on ${update.reward?.chain?.name}`;
      case 105:
        return `${update.actor} assigned ${update.taskType} `;
      case 106:
        return `${update.actor} updated reviewer `;
      case 150:
        return `${update.actor} applied to ${update.taskType}`;
      case 151:
        return `${update.actor} updated application to ${update.taskType}`;
      case 152:
        return `${update.actor} picked ${update.selectedApplicant}'s application to ${update.taskType}`;
      case 200:
        return `${update.actor} asked for a review`;
      case 201:
        return `${update.actor} added comments`;
      case 205:
        return `${update.actor} closed ${update.taskType}`;
      case 300:
        return `${update.actor} paid for the ${update.taskType}`;
      case 301:
        return `${update.actor} added feedback`;
      case 400:
        return `${update.actor} moved ${update.taskType} from ${update.columnChange.sourceId} to ${update.columnChange.destinationId}`;
    }
  };
  return {
    generateActivityLine,
    activityIcons,
  };
}
