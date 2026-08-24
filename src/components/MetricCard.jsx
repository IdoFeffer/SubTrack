const VARIANTS = {
  gradient: {
    box: "bg-[linear-gradient(140deg,#7c3aed,#c026d3)]",
    label: "text-white/85",
    value: "text-white",
  },
  teal: {
    box: "bg-[#e7f6f4] border border-[#b9e6e0]",
    label: "text-[#0f766e]",
    value: "text-[#0f766e]",
  },
  rose: {
    box: "bg-[#fff1f2] border border-[#fecdd3]",
    label: "text-[#9f1239]",
    value: "text-[#e11d48]",
  },
  white: {
    box: "bg-white border border-[#ece7f7]",
    label: "text-[#6b5b8a]",
    value: "text-[#1b1033]",
  },
};

export default function MetricCard({
  label,
  value,
  variant = "white",
  padding = "p-5",
  labelSize = "text-[13px]",
  valueSize = "text-[32px]",
}) {
  const v = VARIANTS[variant];
  return (
    <div className={`rounded-[18px] ${padding} ${v.box}`}>
      <p className={`m-0 mb-2 ${labelSize} ${v.label}`}>{label}</p>
      <p className={`m-0 font-bold ${valueSize} ${v.value}`} dir="ltr" style={{ textAlign: "right" }}>
        {value}
      </p>
    </div>
  );
}
