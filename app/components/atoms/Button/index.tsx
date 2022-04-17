import classNames from "classnames";
import React from "react";
import styles from "./style.module.css";
import {Button as MuiButton} from "@mui/material";
type Props = {
	as: "button" | "link";
	theme?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
	type?: "text" | "outlined" | "contained";
    buttonType?: "submit" | "reset" | "button";
	className?: string;
	children?: React.ReactNode;
	onClick?: () => void;
	href?: string;
};

const Button: React.FC<Props> = ({
	theme,
	type,
	children,
	onClick,
    buttonType,
	as,
	className,
	href,
}) => {
	if (as === "button") {
		return (
			<MuiButton
                type={buttonType}
				onClick={onClick}
                variant={type}
                color={theme}
				className={classNames(
					styles.btn,
					className
				)}
			>
				{children}
			</MuiButton>
		);
	} else {
		return (
			<a
				className={classNames(
					styles.btn,
					className
				)}
				onClick={onClick}
				href={href}
				target={"_blank"} rel="noreferrer"
			>
				{children}
			</a>
		);
	}
};

Button.defaultProps = {
	theme: "primary",
	type: "outlined",
};

export default Button;
