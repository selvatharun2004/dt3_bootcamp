type Option = string;

export default function Segmented(props: {
  value: Option;
  options: Option[];
  onChange: (value: Option) => void;
}) {
  return (
    <div className="segmented" role="group" aria-label="Time period">
      {props.options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={opt === props.value ? "segmented__btn isActive" : "segmented__btn"}
          onClick={() => props.onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
