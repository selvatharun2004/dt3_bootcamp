import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

export default function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
) {
  const { variant = "primary", className, ...rest } = props;
  const classes = ["btn", `btn--${variant}`, className].filter(Boolean).join(" ");
  return <button className={classes} {...rest} />;
}
