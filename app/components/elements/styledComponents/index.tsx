import { LoadingButton } from "@mui/lab";
import {
  ButtonProps,
  styled,
  Tooltip,
  tooltipClasses,
  TooltipProps,
} from "@mui/material";

export const PrimaryButton = styled(LoadingButton)<ButtonProps>(
  ({ theme }) => ({
    color: theme.palette.getContrastText(theme.palette.background.paper),
    borderRadius: "20px",
    textTransform: "none",
  })
);

export const FieldContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: "0.5rem 0.5rem",
}));

export const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#eaeaea",
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: "0.8rem",
    maxWidth: "22rem",
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "#eaeaea",
  },
}));

export const NavbarButton = styled(LoadingButton)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText("#000f29"),
  borderRadius: "22.5px",
  textTransform: "none",
  border: "1px solid #eaeaea",
  width: "155px",
  height: "35px",
}));
