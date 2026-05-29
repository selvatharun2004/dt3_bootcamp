type Tone = "default" | "danger";

export default function StatPill(props: { label: string; value: string; tone?: Tone }) {
  const tone = props.tone ?? "default";
  return (
    <div className={tone === "danger" ? "pill pill--danger" : "pill"}>
      <div className="pill__label">{props.label}</div>
      <div className="pill__value">{props.value}</div>
    </div>
  );
}
